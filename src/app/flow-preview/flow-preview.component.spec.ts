import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowPreviewComponent } from './flow-preview.component';

describe('FlowPreviewComponent', () => {
  let component: FlowPreviewComponent;
  let fixture: ComponentFixture<FlowPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlowPreviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlowPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
