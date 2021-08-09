import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

const materials = [
  MatButtonModule,
  MatExpansionModule,
  MatInputModule,
  MatFormFieldModule,
  MatDialogModule ,
  MatCardModule,
  MatGridListModule,
  MatSelectModule,
  MatButtonToggleModule,
]


@NgModule({
  declarations: [],
  imports: [ materials ],
  exports: [ materials]
})
export class MaterialModule { }
