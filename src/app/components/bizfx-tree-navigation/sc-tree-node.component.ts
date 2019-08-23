import { Component, Input, OnInit, ComponentFactory, ComponentFactoryResolver, ViewContainerRef, ViewChild } from '@angular/core';
import { ScBizFxView, ScBizFxViewsService, ScBizFxProperty } from '@sitecore/bizfx'
import { ScBizfxTreeNavComponent } from './sc-bizfx-tree-nav.component'

@Component({
  selector: 'sc-tree-node',
  templateUrl: './sc-tree-node.component.html',
  styleUrls: ['./sc-tree-node.component.css']
})
export class ScTreeNodeComponent implements OnInit {
  @Input() parent: ScTreeNodeComponent | ScBizfxTreeNavComponent;
  @Input() view: ScBizFxView;
  @ViewChild('children', { read: ViewContainerRef }) viewContainerRef: ViewContainerRef;
  public open: boolean = false;
  public loading: boolean = false;
  public hasChildren: boolean = true;
  private properties: { [name: string]: ScBizFxProperty } = {};
  private factory: ComponentFactory<ScTreeNodeComponent>;

  constructor(
    private resolver: ComponentFactoryResolver,
    private viewsService: ScBizFxViewsService) { }

  ngOnInit(): void {
    this.factory = this.resolver.resolveComponentFactory(ScTreeNodeComponent);

    this.view.Properties.forEach(prop => {
      this.properties[prop.Name] = prop;
    });

    // load children if no siblings
    if (this.parent instanceof ScTreeNodeComponent && this.parent.viewContainerRef.length == 1) {
      this.toggleNode();
    }
  }

  get label(): string {
    var labelProp = this.properties['DisplayName']
    || this.properties['Name']
    || this.properties['UserName']
    || this.properties['AddressName']
    || (this.view.Name === 'EntityVersion' && this.properties['Version']);

    return (labelProp && labelProp.Value) || this.view.DisplayName;
  }

  get linkType(): string {
    if (this.parent instanceof ScBizfxTreeNavComponent) {
      return 'Dashboard';
    }

    if (this.view.Name === 'EntityVersion') {
      return 'EntityLink';
    }

    var uiType = this.view.Properties.find(prop => !!prop.UiType)
    return uiType ? uiType.UiType : 'None';
  }

  builItemLink(): string {
    const parts = this.view.ItemId.split('|');
    return parts.length === 2 ? `${parts[0]}/${parts[1]}` : `${this.view.EntityId}/${this.view.ItemId}`;
  }

  hasAncestor(id: string): boolean {
    let node = this.parent;

    while (node instanceof ScTreeNodeComponent) {
      if (node.view.ItemId.split('|').includes(id)) {
        return true;
      }
      node = node.parent;
    }

    return false;
  }

  async toggleNode(): Promise<void> {
    this.open = !this.open;

    if (!this.open) {
      this.viewContainerRef.clear()
      return;
    }

    this.loading = true;
    const childViews = await this.getChildViews();
    this.hasChildren = childViews.length > 0;

    // create child nodes dynamically
    childViews.filter(child => child.Name !== 'Details').forEach(child => {
      const ref = this.viewContainerRef.createComponent(this.factory);
      ref.instance.parent = this;
      ref.instance.view = child;
    });

    this.loading = false;
  }

  async getChildViews(): Promise<ScBizFxView[]> {
    // convert navigation view to entity view
    if (this.parent instanceof ScBizfxTreeNavComponent) {
      const view = await this.viewsService.getView(this.view.ItemId);
      return Promise.resolve(view.ChildViews);
    }

    if (this.view.ChildViews.length > 0) {
      return Promise.resolve(this.view.ChildViews);
    }

    if (this.view.ItemId.includes('|')) {
      const parts = this.view.ItemId.split('|');
      const view = await this.viewsService.getView('Master', parts[0], null, parts[1], this.view.EntityVersion);
      return Promise.resolve(view.ChildViews);
    }

    // already opened in the ancestors (for prevent a infinite reference)
    if (!this.view.ItemId || this.hasAncestor(this.view.ItemId)) {
      return Promise.resolve([]);
    }

    const view = await this.viewsService.getView('Master', this.view.ItemId, null, null, this.view.EntityVersion);
    return Promise.resolve(view.ChildViews);
  }
}