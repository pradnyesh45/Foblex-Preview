import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FFlowModule } from '@foblex/flow';
import { FlowPreviewComponent } from './flow-preview/flow-preview.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FFlowModule, FlowPreviewComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'foblex-preview';
}
