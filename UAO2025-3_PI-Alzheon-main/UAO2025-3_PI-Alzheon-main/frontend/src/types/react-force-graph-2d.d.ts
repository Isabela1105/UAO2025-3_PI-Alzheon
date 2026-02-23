declare module 'react-force-graph-2d' {
  import * as React from 'react';

  export interface NodeObject {
    id: string | number;
    [key: string]: any;
  }

  export interface LinkObject {
    source: string | number | NodeObject;
    target: string | number | NodeObject;
    [key: string]: any;
  }

  export interface ForceGraph2DProps {
    graphData: {
      nodes: NodeObject[];
      links: LinkObject[];
    };
    nodeLabel?: (node: NodeObject) => React.ReactNode;
    linkLabel?: (link: LinkObject) => React.ReactNode;
    nodeAutoColorBy?: string;
    linkColor?: (link: LinkObject) => string;
    linkWidth?: (link: LinkObject) => number;
    linkDirectionalArrowLength?: number;
    linkDirectionalArrowRelPos?: number;
    ref?: React.Ref<any>;
  }

  export default class ForceGraph2D extends React.Component<ForceGraph2DProps> {}
}
