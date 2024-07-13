import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const ForceGraph = ({ data }) => {
  const svgRef = useRef();
  const svgContainerRef = useRef();
  const zoomLevelRef = useRef(1);

  useEffect(() => {
    
    // Parse the CSV data
    const parsedData = d3.csvParseRows(data);

    // Extract nodes and links from the parsed data
    const header = parsedData[0];
    const rows = parsedData.slice(1); // Exclude the header row
    const keywordsIndex = header.indexOf('keywords');
    const nodesSet = new Set();
    const links = [];
    
    rows.forEach(row => {
      const keywords = row[keywordsIndex].split('- ');
      keywords.forEach(keyword => nodesSet.add(keyword));
      for (let i = 0; i < Math.min(keywords.length, 5); i++) {
        for (let j = i + 1; j < Math.min(keywords.length, 5); j++) {
          links.push({ source: keywords[i], target: keywords[j] });
        }
      }
    });
    
    const nodes = Array.from(nodesSet).map(keyword => ({ id: keyword }));

    // Set up the SVG dimensions
    const width = 1500;
    const height = 900;

    // Create the SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .style('background-color', '#F0F8FF');

    const svgContainer = svg.append('g').attr('class', 'svg-container').attr('pointer-events', 'all');
    svgContainerRef.current = svgContainer;

    // Create the force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d) => d.id).distance(350)) 
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 3, height / 2));

    // Create the links
    const link = svgContainer.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6);

    // Create the nodes
    const node = svgContainer.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 10)
      .attr('fill', '#fff')
      .attr('stroke', '#000')
      .attr('stroke-width', 1.5)
      .attr('fill', 'steelblue');

    // Add node labels
    const label = svgContainer.append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .text((d) => d.id)
      .attr('font-size', 20)
      .attr('dx', 15)
      .attr('dy', 4);

    // Update the positions of nodes and links on each simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node
        .attr('cx', (d) => d.x)
        .attr('cy', (d) => d.y);

      label
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y);
    });
    
    // Handle zoom in/out
    const handleZoom = (event) => {
      const { deltaY } = event;
      const zoomFactor = 1 + (deltaY * 0.001);
      zoomLevelRef.current *= zoomFactor;
      svgContainer.attr('transform', `scale(${zoomLevelRef.current})`);
    };

    // Attach zoom event listener to the SVG container
    svg.call(d3.zoom().on('zoom', handleZoom));
    const drag = d3.drag()
      .on('start', dragStarted)
      .on('drag', dragged)
      .on('end', dragEnded);

    // Apply drag behavior to nodes
    node.call(drag);

    // Drag started event handler
    function dragStarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    // Dragged event handler
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    // Drag ended event handler
    function dragEnded(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }, [data]);

  return <svg ref={svgRef} />;
};

export default ForceGraph;
