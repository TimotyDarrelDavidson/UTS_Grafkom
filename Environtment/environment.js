// Generate desert terrain with dunes
export function generateDesertTerrain(width = 200, depth = 200, segments = 50) {
  const V = [];
  const F = [];
  
  const segmentWidth = width / segments;
  const segmentDepth = depth / segments;
  
  // Generate vertices with sand dune heights
  for (let z = 0; z <= segments; z++) {
    for (let x = 0; x <= segments; x++) {
      const posX = (x * segmentWidth) - width / 2;
      const posZ = (z * segmentDepth) - depth / 2;
      
      // Create dune-like waves
      const wave1 = Math.sin(posX * 0.05) * Math.cos(posZ * 0.03) * 3;
      const wave2 = Math.sin(posX * 0.02 + posZ * 0.02) * 2;
      const wave3 = Math.cos(posX * 0.08) * Math.sin(posZ * 0.06) * 1.5;
      const posY = wave1 + wave2 + wave3 - 15; // Lower the terrain
      
      // Sand colors - warm orange/yellow gradient
      const colorVariation = (Math.sin(posX * 0.1) + Math.cos(posZ * 0.1)) * 0.1;
      const sandR = 0.85 + colorVariation;
      const sandG = 0.65 + colorVariation * 0.5;
      const sandB = 0.35 + colorVariation * 0.3;
      
      V.push(posX, posY, posZ, sandR, sandG, sandB);
    }
  }
  
  // Generate faces
  const verticesPerRow = segments + 1;
  for (let z = 0; z < segments; z++) {
    for (let x = 0; x < segments; x++) {
      const a = z * verticesPerRow + x;
      const b = a + 1;
      const c = (z + 1) * verticesPerRow + x;
      const d = c + 1;
      
      F.push(a, b, d, a, d, c);
    }
  }
  
  return { vertices: V, faces: F };
}

// Generate sky dome with sunset gradient
export function generateSkyDome(radius = 100, segments = 32) {
  const V = [];
  const F = [];
  
  // Generate hemisphere vertices
  for (let lat = 0; lat <= segments / 2; lat++) {
    const theta = (lat * Math.PI) / segments;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    
    for (let lon = 0; lon <= segments; lon++) {
      const phi = (lon * 2 * Math.PI) / segments;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      
      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;
      
      // Sunset gradient colors
      const heightFactor = y; // -1 to 1
      
      let r, g, b;
      if (heightFactor > 0.3) {
        // Top sky - purple to blue
        const t = (heightFactor - 0.3) / 0.7;
        r = 0.3 + t * 0.2; // purple to light blue
        g = 0.2 + t * 0.5;
        b = 0.5 + t * 0.4;
      } else if (heightFactor > -0.2) {
        // Horizon - orange to yellow
        const t = (heightFactor + 0.2) / 0.5;
        r = 1.0 - t * 0.2;
        g = 0.5 + t * 0.2;
        b = 0.2 + t * 0.3;
      } else {
        // Lower horizon - deep orange
        r = 0.95;
        g = 0.6;
        b = 0.25;
      }
      
      V.push(
        x * radius, y * radius, z * radius,
        r, g, b
      );
    }
  }
  
  // Generate faces
  const verticesPerRow = segments + 1;
  for (let lat = 0; lat < segments / 2; lat++) {
    for (let lon = 0; lon < segments; lon++) {
      const a = lat * verticesPerRow + lon;
      const b = a + verticesPerRow;
      const c = a + 1;
      const d = b + 1;
      
      F.push(a, b, c, c, b, d);
    }
  }
  
  return { vertices: V, faces: F };
}

// Generate sun sphere
export function generateSun(radius = 5, segments = 20) {
  const V = [];
  const F = [];
  
  // Generate sphere vertices
  for (let lat = 0; lat <= segments; lat++) {
    const theta = (lat * Math.PI) / segments;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);
    
    for (let lon = 0; lon <= segments; lon++) {
      const phi = (lon * 2 * Math.PI) / segments;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);
      
      const x = cosPhi * sinTheta;
      const y = cosTheta;
      const z = sinPhi * sinTheta;
      
      // Bright sun color with glow
      const brightness = 0.8 + Math.random() * 0.2;
      V.push(
        x * radius, y * radius, z * radius,
        1.0 * brightness, 0.85 * brightness, 0.4 * brightness
      );
    }
  }
  
  // Generate faces
  const verticesPerRow = segments + 1;
  for (let lat = 0; lat < segments; lat++) {
    for (let lon = 0; lon < segments; lon++) {
      const a = lat * verticesPerRow + lon;
      const b = a + verticesPerRow;
      const c = a + 1;
      const d = b + 1;
      
      F.push(a, b, c, c, b, d);
    }
  }
  
  return { vertices: V, faces: F };
}

// Generate cloud yang lebih baik
export function generateCloud(width = 10, height = 3, depth = 8) {
  const V = [];
  const F = [];
  
  // Lebih banyak blob untuk awan yang lebih tebal
  const blobs = [
    { x: 0, y: 0, z: 0, rx: width * 0.6, ry: height * 0.8, rz: depth * 0.5 },
    { x: width * 0.4, y: height * 0.3, z: 0, rx: width * 0.5, ry: height * 0.7, rz: depth * 0.4 },
    { x: -width * 0.3, y: height * 0.2, z: 0, rx: width * 0.4, ry: height * 0.6, rz: depth * 0.35 },
    { x: width * 0.2, y: -height * 0.2, z: depth * 0.3, rx: width * 0.35, ry: height * 0.5, rz: depth * 0.3 },
    { x: -width * 0.25, y: -height * 0.15, z: -depth * 0.25, rx: width * 0.3, ry: height * 0.45, rz: depth * 0.25 },
    { x: 0, y: height * 0.4, z: depth * 0.15, rx: width * 0.25, ry: height * 0.4, rz: depth * 0.2 }
  ];
  
  const segments = 10; // Sedikit lebih banyak segments
  
  blobs.forEach((blob) => {
    const baseIndex = V.length / 6;
    
    for (let lat = 0; lat <= segments; lat++) {
      const theta = (lat * Math.PI) / segments;
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);
      
      for (let lon = 0; lon <= segments; lon++) {
        const phi = (lon * 2 * Math.PI) / segments;
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        
        const x = blob.x + cosPhi * sinTheta * blob.rx;
        const y = blob.y + cosTheta * blob.ry;
        const z = blob.z + sinPhi * sinTheta * blob.rz;
        
        // Warna awan - putih dengan sedikit variasi
        const variation = Math.random() * 0.1;
        const cloudR = 0.95 + variation;
        const cloudG = 0.95 + variation;
        const cloudB = 0.98;
        
        V.push(x, y, z, cloudR, cloudG, cloudB);
      }
    }
    
    // Generate faces
    const verticesPerRow = segments + 1;
    for (let lat = 0; lat < segments; lat++) {
      for (let lon = 0; lon < segments; lon++) {
        const a = baseIndex + lat * verticesPerRow + lon;
        const b = a + verticesPerRow;
        const c = a + 1;
        const d = b + 1;
        
        F.push(a, b, c);
        F.push(c, b, d);
      }
    }
  });
  
  return { vertices: V, faces: F };
}