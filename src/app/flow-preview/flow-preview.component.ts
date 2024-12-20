import { Component, ViewChild, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FFlowModule, FCanvasComponent, EFMarkerType } from '@foblex/flow';
import * as dagre from 'dagre';
import flowData from '../../assets/json/example1.json';

interface FlowNode {
  id: string;
  position: { x: number; y: number };
  data: { name: string };
  successTarget?: string;
  failureTarget?: string;
}

@Component({
  selector: 'app-flow-preview',
  standalone: true,
  imports: [CommonModule, FFlowModule],
  template: `
    <div class="flow-container">
      <h1>Foblex Preview</h1>
      <f-flow (fLoaded)="onLoaded()" fDraggable fZoom>
        <f-background></f-background>
        <f-canvas>
          <!-- Success Connections -->
          <f-connection
            *ngFor="let node of nodes"
            [fOutputId]="node.id + '-out'"
            [fInputId]="(node.successTarget || node.id) + '-in'"
            fBehavior="floating"
            class="success-connection"
          >
            <svg
              viewBox="0 0 10 10"
              fMarker
              [type]="eMarkerType.START"
              [height]="10"
              [width]="10"
              [refX]="5"
              [refY]="5"
            >
              <circle cx="5" cy="5" r="2" fill="black"></circle>
            </svg>
            <svg
              viewBox="0 0 6 6"
              fMarker
              [type]="eMarkerType.END"
              [height]="6"
              [width]="6"
              [refX]="5"
              [refY]="3"
            >
              <path d="M0,0 L6,3 0,6Z" stroke="none"></path>
            </svg>
            <span class="connection-label success-label">Success</span>
          </f-connection>

          <!-- Failure Connections -->
          <f-connection
            *ngFor="let node of nodes"
            [fOutputId]="node.id + '-out'"
            [fInputId]="(node.failureTarget || node.id) + '-in'"
            fBehavior="floating"
            class="failure-connection"
          >
            <svg
              viewBox="0 0 10 10"
              fMarker
              [type]="eMarkerType.START"
              [height]="10"
              [width]="10"
              [refX]="5"
              [refY]="5"
            >
              <circle cx="5" cy="5" r="2" fill="black"></circle>
            </svg>
            <svg
              viewBox="0 0 6 6"
              fMarker
              [type]="eMarkerType.END"
              [height]="6"
              [width]="6"
              [refX]="5"
              [refY]="3"
            >
              <path d="M0,0 L6,3 0,6Z" stroke="none"></path>
            </svg>
            <span class="connection-label failure-label">Failure</span>
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
            {{ node.data.name }}
          </div>
        </f-canvas>
        <f-minimap></f-minimap>
      </f-flow>
    </div>
  `,
  styles: [
    `
      .flow-container {
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
      }

      f-flow {
        flex: 1;
        min-height: 0;
        background: #f5f5f5;
      }

      .f-node {
        min-width: 200px;
        padding: 12px;
        background: white;
        border: 1px solid #2196f3;
        border-radius: 4px;
        text-align: center;
      }

      ::ng-deep {
        .f-connection {
          .f-connection-path {
            stroke-width: 2;
            fill: none;
          }

          .f-marker {
            path {
              fill: currentColor;
              stroke: none;
            }
            circle {
              fill: black;
              stroke: none;
            }
          }

          .connection-label {
            background: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
            position: absolute;
            transform: translate(-50%, -50%);
          }

          &.success-connection {
            color: #4caf50;
            .f-connection-path {
              stroke: #4caf50;
            }
            .success-label {
              color: #4caf50;
              border: 1px solid #4caf50;
            }
          }

          &.failure-connection {
            color: #f44336;
            .f-connection-path {
              stroke: #f44336;
            }
            .failure-label {
              color: #f44336;
              border: 1px solid #f44336;
            }
          }
        }

        .f-connection-drag-handle {
          display: none;
        }
      }
    `,
  ],
})
export class FlowPreviewComponent implements OnInit {
  @ViewChild(FCanvasComponent, { static: true })
  public fCanvas!: FCanvasComponent;

  nodes: FlowNode[] = [];
  public readonly eMarkerType = EFMarkerType;

  ngOnInit() {
    this.processFlowData(flowData);
    this.calculateLayout();
    console.log('Processed Nodes:', this.nodes);
  }

  private processFlowData(data: any) {
    console.log('Input Flow Data:', data);
    this.nodes = Object.entries(data.steps).map(([id, step]: [string, any]) => {
      const node = {
        id,
        position: { x: 0, y: 0 },
        data: { name: step.name },
        successTarget:
          step.actions?.SUCCESS?.next_key === 'ACCEPT'
            ? undefined
            : step.actions?.SUCCESS?.next_key,
        failureTarget:
          step.actions?.FAILURE?.next_key === 'ACCEPT'
            ? undefined
            : step.actions?.FAILURE?.next_key,
      };
      console.log('Created Node:', node);
      return node;
    });
  }

  private calculateLayout() {
    const g = new dagre.graphlib.Graph();

    g.setGraph({
      rankdir: 'TB',
      nodesep: 100,
      ranksep: 100,
      marginx: 100,
      marginy: 100,
    });

    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes
    this.nodes.forEach((node) => {
      g.setNode(node.id, {
        width: 300,
        height: 80,
      });
    });

    // Add both success and failure edges
    this.nodes.forEach((node) => {
      if (node.successTarget) {
        g.setEdge(node.id, node.successTarget);
      }
      if (node.failureTarget) {
        g.setEdge(node.id, node.failureTarget);
      }
    });

    // Calculate layout
    dagre.layout(g);

    // Update node positions
    this.nodes = this.nodes.map((node) => {
      const pos = g.node(node.id);
      console.log(`Position for node ${node.id}:`, pos);
      return {
        ...node,
        position: {
          x: pos.x - 150,
          y: pos.y - 40,
        },
      };
    });
  }

  public onLoaded(): void {
    console.log('Canvas loaded');
    setTimeout(() => {
      this.fCanvas.resetScaleAndCenter(true);
      this.fCanvas.setZoom(0.65);
    }, 100);
  }
}
