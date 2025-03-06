import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdiantarPrestacoesComponent } from './adiantar-prestacoes.component';

describe('AdiantarPrestacoesComponent', () => {
  let component: AdiantarPrestacoesComponent;
  let fixture: ComponentFixture<AdiantarPrestacoesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdiantarPrestacoesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdiantarPrestacoesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
