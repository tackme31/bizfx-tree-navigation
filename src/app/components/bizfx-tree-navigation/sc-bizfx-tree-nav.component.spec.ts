import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScBizFxTreeNavComponent } from './sc-bizfx-tree-nav.component';

describe('ScBizFxTreeNavComponent', () => {
  let component: ScBizFxTreeNavComponent;
  let fixture: ComponentFixture<ScBizFxTreeNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScBizFxTreeNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScBizFxTreeNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
