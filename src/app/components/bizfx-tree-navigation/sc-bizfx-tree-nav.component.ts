import { Component } from '@angular/core';
import {
  ScBizFxNavComponent,
  ScBizFxContextService,
  ScBizFxViewsService,
  ScBizFxAuthService
} from '@sitecore/bizfx'

@Component({
  selector: 'sc-bizfx-tree-nav',
  templateUrl: './sc-bizfx-tree-nav.component.html',
  styleUrls: ['./sc-bizfx-tree-nav.component.css']
})
export class ScBizFxTreeNavComponent extends ScBizFxNavComponent {
  constructor(bizFxContext: ScBizFxContextService, viewsService: ScBizFxViewsService, authService: ScBizFxAuthService) {
    super(bizFxContext, viewsService, authService);
  }
}
