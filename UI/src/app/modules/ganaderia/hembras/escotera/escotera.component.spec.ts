import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EscoteraComponent } from './escotera.component';

describe('EscoteraComponent', () => {
  let component: EscoteraComponent;
  let fixture: ComponentFixture<EscoteraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EscoteraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EscoteraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
