import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToretesComponent } from './toretes.component';

describe('ToretesComponent', () => {
  let component: ToretesComponent;
  let fixture: ComponentFixture<ToretesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToretesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToretesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
