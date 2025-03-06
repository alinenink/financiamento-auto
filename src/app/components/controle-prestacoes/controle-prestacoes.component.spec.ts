import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlePrestacoesComponent } from './controle-prestacoes.component';

describe('ControlePrestacoesComponent', () => {
  let component: ControlePrestacoesComponent;
  let fixture: ComponentFixture<ControlePrestacoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlePrestacoesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControlePrestacoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
