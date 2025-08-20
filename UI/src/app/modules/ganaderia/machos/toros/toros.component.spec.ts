import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TorosComponent } from './toros.component';

describe('TorosComponent', () => {
  let component: TorosComponent;
  let fixture: ComponentFixture<TorosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TorosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TorosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
