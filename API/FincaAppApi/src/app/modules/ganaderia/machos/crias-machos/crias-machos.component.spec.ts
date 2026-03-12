import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriasMachosComponent } from './crias-machos.component';

describe('CriasMachosComponent', () => {
  let component: CriasMachosComponent;
  let fixture: ComponentFixture<CriasMachosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriasMachosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriasMachosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
