import { Component, Input, OnInit, ComponentFactory, ComponentFactoryResolver, ViewContainerRef, ViewChild } from '@angular/core';
import { ScBizFxView, ScBizFxViewsService, ScBizFxProperty } from '@sitecore/bizfx'
import { ScBizFxTreeNavComponent } from './sc-bizfx-tree-nav.component'

@Component({
  selector: 'sc-tree-node',
  templateUrl: './sc-tree-node.component.html',
  styleUrls: ['./sc-tree-node.component.css']
})
export class ScTreeNodeComponent implements OnInit {
  @Input() parent: ScTreeNodeComponent | ScBizFxTreeNavComponent;
  @Input() view: ScBizFxView;
  @ViewChild('children', { read: ViewContainerRef }) viewContainerRef: ViewContainerRef;
  public open: boolean = false;
  public loading: boolean = false;
  public hasChildren: boolean = true;
  private factory: ComponentFactory<ScTreeNodeComponent>;

  constructor(
    private resolver: ComponentFactoryResolver,
    private viewsService: ScBizFxViewsService) { }

  ngOnInit(): void {
    this.factory = this.resolver.resolveComponentFactory(ScTreeNodeComponent);

    // load children if no siblings
    if (this.parent instanceof ScTreeNodeComponent && this.parent.viewContainerRef.length == 1) {
      this.toggleNode();
    }
  }

  get label(): string {
    const props: any = {};
    this.view.Properties.forEach(prop => props[prop.Name] = prop.Value);
    if (props['DisplayName']) {
      return props['DisplayName'];
    }

    if (this.view.Name === 'EntityVersion' && props['Version']) {
      return props['Version']
    }

    const linkProp = this.view.Properties.find(prop => prop.UiType && prop.UiType.endsWith('Link'));
    if (linkProp) {
      return linkProp.Value;
    }

    return props['Name'] || this.view.DisplayName;
  }

  get linkType(): string {
    if (this.parent instanceof ScBizFxTreeNavComponent) {
      return 'Dashboard';
    }

    if (this.view.Name === 'EntityVersion') {
      return 'EntityLink';
    }

    const uiProp = this.view.Properties.find(prop => !!prop.UiType);
    return (uiProp && uiProp.UiType) || 'None';
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
    if (this.parent instanceof ScBizFxTreeNavComponent) {
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