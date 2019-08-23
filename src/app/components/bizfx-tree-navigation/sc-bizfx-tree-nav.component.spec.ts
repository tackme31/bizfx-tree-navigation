import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScBizfxTreeNavComponent } from './sc-bizfx-tree-nav.component';

describe('ScBizfxTreeNavComponent', () => {
  let component: ScBizfxTreeNavComponent;
  let fixture: ComponentFixture<ScBizfxTreeNavComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScBizfxTreeNavComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScBizfxTreeNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
