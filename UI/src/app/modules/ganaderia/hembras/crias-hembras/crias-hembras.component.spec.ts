import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CriasHembrasComponent } from './crias-hembras.component';

describe('CriasHembrasComponent', () => {
  let component: CriasHembrasComponent;
  let fixture: ComponentFixture<CriasHembrasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CriasHembrasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CriasHembrasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
