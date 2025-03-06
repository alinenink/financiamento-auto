import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuitarContratoComponent } from './quitar-contrato.component';

describe('QuitarContratoComponent', () => {
  let component: QuitarContratoComponent;
  let fixture: ComponentFixture<QuitarContratoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuitarContratoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuitarContratoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
