import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { University } from './data';

interface MapProps {
  universities: University[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export const USMap: React.FC<MapProps> = ({ universities, selectedId, onSelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const observeTarget = containerRef.current;
    if (!observeTarget) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(observeTarget);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    const projection = d3.geoAlbersUsa()
      .translate([width / 2, height / 2])
      .scale(Math.min(width, height) * 1.3);

    const path = d3.geoPath().projection(projection);

    const statesGroup = svg.append('g').attr('class', 'states-group');
    const pointsGroup = svg.append('g').attr('class', 'points-group');

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 12])
      .on('zoom', (event) => {
        statesGroup.attr('transform', event.transform);
        pointsGroup.selectAll('.uni-pin').attr('transform', (d: any) => {
          const coords = projection([d.lng, d.lat]);
          if (!coords) return null;
          const [x, y] = coords;
          return `translate(${event.transform.applyX(x)}, ${event.transform.applyY(y)})`;
        });
      });

    svg.call(zoom as any);

    d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then((us: any) => {
      if (!us) return;

      const states = topojson.feature(us, us.objects.states) as any;
      
      statesGroup.selectAll('path')
        .data(states.features)
        .enter()
        .append('path')
        .attr('d', path as any)
        .attr('fill', '#e9e5de')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1)
        .attr('class', 'transition-colors duration-500 hover:fill-[#ddd8cf]');

      statesGroup.append('path')
        .datum(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
        .attr('fill', 'none')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 0.5)
        .attr('d', path as any);

      // Render pins
      const pins = pointsGroup.selectAll('.uni-pin')
        .data(universities, (d: any) => d.id)
        .enter()
        .append('g')
        .attr('class', 'uni-pin group cursor-pointer')
        .attr('transform', (d) => {
          const coords = projection([d.lng, d.lat]);
          return coords ? `translate(${coords[0]}, ${coords[1]})` : null;
        })
        .on('click', (event, d) => {
          event.stopPropagation();
          onSelect(d.id);
        });

      pins.each(function(uni) {
        const pin = d3.select(this);
        const isActive = selectedId === uni.id;
        const iconSize = isActive ? 42 : 30;

        if (isActive) {
          pin.append('circle')
            .attr('r', iconSize * 0.7)
            .attr('fill', 'rgba(107, 112, 92, 0.2)')
            .attr('class', 'animate-pulse');
        }

        const clipId = `clip-${uni.id}`;
        pin.append('defs')
          .append('clipPath')
          .attr('id', clipId)
          .append('circle')
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('r', iconSize / 2);

        pin.append('circle')
          .attr('r', iconSize / 2 + 1)
          .attr('fill', 'white')
          .attr('stroke', isActive ? '#6b705c' : '#cb997e')
          .attr('stroke-width', isActive ? 3 : 1.5)
          .attr('class', 'transition-all duration-300 shadow-sm');

        pin.append('image')
          .attr('xlink:href', uni.logo)
          .attr('x', -iconSize / 2)
          .attr('y', -iconSize / 2)
          .attr('width', iconSize)
          .attr('height', iconSize)
          .attr('clip-path', `url(#${clipId})`)
          .style('image-rendering', 'crisp-edges')
          .on('error', function() {
            d3.select(this).remove();
            pin.append('circle')
               .attr('r', iconSize / 2)
               .attr('fill', isActive ? '#6b705c' : '#cb997e');
          });

        pin.append('text')
          .attr('y', iconSize / 2 + 12)
          .attr('text-anchor', 'middle')
          .attr('fill', isActive ? '#6b705c' : '#6d6875')
          .attr('class', `text-[10px] font-sans tracking-tight leading-none ${isActive ? 'font-bold opacity-100' : 'opacity-0 group-hover:opacity-100 transition-opacity duration-300'}`)
          .style('pointer-events', 'none')
          .text(uni.name);
      });
    });

    svg.on('click', () => onSelect(null));

  }, [dimensions, universities, selectedId, onSelect]);

  return (
    <div ref={containerRef} className="w-full h-full p-4 relative bg-[#faf9f6] rounded-[24px]">
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full"
      />
      
      <div className="absolute top-6 left-6 flex flex-col gap-2">
        <div className="bg-white/80 backdrop-blur-sm p-2 rounded-lg border border-border-toned shadow-sm flex flex-col items-center gap-1">
          <span className="text-[10px] text-text-muted font-bold px-1 uppercase tracking-tighter">Zoom</span>
          <div className="text-[10px] text-text-muted italic px-1">Use scroll or pinch</div>
        </div>
      </div>

      <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm p-4 rounded-xl text-[11px] border border-border-toned shadow-sm space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1">Institution Types</span>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-clay border border-white"></div>
          <span className="text-text-main">National University</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-accent-sage border border-white"></div>
          <span className="text-text-main">Liberal Arts College</span>
        </div>
      </div>
    </div>
  );
};
