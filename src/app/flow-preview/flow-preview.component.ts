import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FFlowModule, FCanvasComponent } from '@foblex/flow';
import flowData from '../../assets/json/example1.json';

interface FlowNode {
  id: string;
  name: string;
  position: { x: number; y: number };
  successTarget?: string;
  failureTarget?: string;
}

@Component({
  selector: 'app-flow-preview',
  standalone: true,
  imports: [CommonModule, FFlowModule],
  template: `
    <h1>Foblex Preview</h1>
    <f-flow (fLoaded)="onLoaded()" fDraggable>
      <f-canvas>
        <!-- Success Connections -->
        <f-connection
          *ngFor="let node of nodes"
          [fOutputId]="node.id + '-out'"
          [fInputId]="(node.successTarget || '') + '-in'"
          fBehavior="floating"
          class="success-connection"
        >
        </f-connection>

        <!-- Failure Connections -->
        <f-connection
          *ngFor="let node of nodes"
          [fOutputId]="node.id + '-out'"
          [fInputId]="(node.failureTarget || '') + '-in'"
          fBehavior="floating"
          class="failure-connection"
        >
        </f-connection>

        <!-- Nodes -->
        <div
          *ngFor="let node of nodes"
          fNode
          [fNodePosition]="node.position"
          fNodeInput
          fNodeOutput
          [fInputId]="node.id + '-in'"
          [fOutputId]="node.id + '-out'"
          fDragHandle
          class="f-node"
        >
          {{ node.name }}
        </div>
      </f-canvas>
    </f-flow>
  `,
  styleUrls: ['./flow-preview.component.scss'],
})
export class FlowPreviewComponent implements OnInit {
  @ViewChild(FCanvasComponent, { static: true })
  public fCanvas!: FCanvasComponent;

  nodes: FlowNode[] = [];

  ngOnInit() {
    this.processFlowData(flowData);
  }

  private processFlowData(data: any) {
    this.nodes = Object.entries(data.steps).map(
      ([id, step]: [string, any], index) => {
        const successTarget = step.actions?.SUCCESS?.next_key;
        const failureTarget = step.actions?.FAILURE?.next_key;

        // Gentle diagonal layout with smaller increments
        const x = index * 250 + 50;
        const y = index * 80 + 50;

        return {
          id,
          name: step.name,
          position: { x, y },
          successTarget: successTarget !== 'ACCEPT' ? successTarget : undefined,
          failureTarget: failureTarget !== 'ACCEPT' ? failureTarget : undefined,
        };
      }
    );
  }

  public onLoaded(): void {
    setTimeout(() => {
      this.fCanvas.resetScaleAndCenter(true);
      this.fCanvas.setZoom(0.8);
    }, 100);
  }
}
