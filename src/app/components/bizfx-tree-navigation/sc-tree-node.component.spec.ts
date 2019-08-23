import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScTreeNodeComponent as ScTreeNodeComponent } from './sc-tree-node.component';

describe('ScTreeNodeComponent', () => {
  let component: ScTreeNodeComponent;
  let fixture: ComponentFixture<ScTreeNodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScTreeNodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScTreeNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
