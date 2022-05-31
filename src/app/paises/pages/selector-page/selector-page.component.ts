import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PaisesService } from '../../services/paises.service';
import { PaisSmall } from '../../interfaces/pais';
import { switchMap, tap } from 'rxjs/operators';
@Component({
  selector: 'app-selector-page',
  templateUrl: './selector-page.component.html',
  styles: [],
})
export class SelectorPageComponent implements OnInit {
  miFormulario: FormGroup = this.fb.group({
    region: ['', Validators.required],
    pais: ['', Validators.required],
    frontera: ['', Validators.required],
  });

  // llenar selectores
  regiones: string[] = [];
  paises: PaisSmall[] = [];
  // fronteras: string[] = [];
  fronteras: PaisSmall[] = [];

  // UI
  cargando: boolean = false;

  constructor(private fb: FormBuilder, private paisesService: PaisesService) {}

  ngOnInit(): void {
    this.regiones = this.paisesService.regiones;

    this.miFormulario
      .get('region')
      ?.valueChanges.pipe(
        tap((_) => {
          this.miFormulario.get('pais')?.reset('');
          this.cargando = true;
        }),
        switchMap((region) => this.paisesService.getPaisesPorRegion(region))
      )
      .subscribe((paises) => {
        this.paises = paises;
        this.cargando = false;
      });

    // Cuando cambiae el país
    this.miFormulario
      .get('pais')
      ?.valueChanges.pipe(
        tap((_) => {
          this.fronteras = [];
          this.miFormulario.get('frontera')?.reset('');
          this.cargando = true;
        }),
        switchMap((codigo) => this.paisesService.getPaisPorCodigo(codigo)),
        switchMap((pais) =>
          this.paisesService.getPaisesPorCodigos(pais![0].borders)
        )
      )
      .subscribe((paises) => {
        if (!paises) {
          return;
        } else if (paises) {
          this.fronteras = paises;
        }
        this.cargando = false;
      });

    // Cuando cambie la region
    // this.miFormulario.get('region')?.valueChanges.subscribe((region) => {
    //   this.paisesService.getPaisesPorRegion(region).subscribe((paises) => {
    //     console.log(paises);

    //     this.paises = paises;
    //   });
    // });
  }

  guardar() {}
}
