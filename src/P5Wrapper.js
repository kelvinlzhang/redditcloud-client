import React, { Component } from 'react';
import p5 from 'p5';

class P5Wrapper extends Component {
    /**
     * Creates canvas by extracting from props
     */ 
    componentDidMount() {
      const { sketch, ...rest } = this.props;
      this.canvas = new p5(sketch(rest), this.wrapper);
    }
  
    /**
     * Recreates canvas by removing old canvas and instantiates a new one.
     * Only recreate canvas if props change.
     */ 
    componentWillReceiveProps(newProps) {
      const { sketch, ...rest } = newProps;
      if (this.props.dict !== newProps.dict) {
        this.canvas.remove();
        this.canvas = new p5(newProps.sketch(rest), this.wrapper);
      }
  
      if (typeof this.canvas.onNewProps === "function") {
        this.canvas.onNewProps(newProps);
      }
    }
  
    /**
     * Removes canvas when class unmounts.
     */ 
    componentWillUnmount() {
      this.canvas.remove();
    }
  
    /**
     * Main render function. Creates a reference to P5Wrapper.
     */
    render() {
      return <div ref={(wrapper) => this.wrapper = wrapper} />;
    }
  }

export default P5Wrapper;
