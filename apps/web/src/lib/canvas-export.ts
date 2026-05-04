import { toPng, toJpeg } from 'html-to-image';
import { Node, Edge } from 'reactflow';

export async function exportCanvasToPNG(
  element: HTMLElement,
  fileName: string = 'canvas.png'
): Promise<void> {
  try {
    const dataUrl = await toPng(element, {
      quality: 1,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });

    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error exporting canvas to PNG:', error);
    throw error;
  }
}

export async function exportCanvasToJPG(
  element: HTMLElement,
  fileName: string = 'canvas.jpg'
): Promise<void> {
  try {
    const dataUrl = await toJpeg(element, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
    });

    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error('Error exporting canvas to JPG:', error);
    throw error;
  }
}

export function exportCanvasToJSON(
  nodes: Node[],
  edges: Edge[],
  fileName: string = 'canvas.json'
): void {
  try {
    const data = {
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting canvas to JSON:', error);
    throw error;
  }
}

export async function importCanvasFromJSON(
  file: File
): Promise<{ nodes: Node[]; edges: Edge[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result !== 'string') {
          throw new Error('Invalid file content');
        }

        const data = JSON.parse(result);
        
        if (!data.nodes || !Array.isArray(data.nodes)) {
          throw new Error('Invalid canvas data: missing nodes');
        }
        
        if (!data.edges || !Array.isArray(data.edges)) {
          throw new Error('Invalid canvas data: missing edges');
        }

        resolve({
          nodes: data.nodes,
          edges: data.edges,
        });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

export async function exportCanvasToPDF(
  element: HTMLElement,
  fileName: string = 'canvas.pdf'
): Promise<void> {
  // Note: For PDF export, you'd typically need a library like jsPDF
  // For now, we'll export as PNG and let users convert if needed
  try {
    await exportCanvasToPNG(element, fileName.replace('.pdf', '.png'));
    console.log('Note: Exported as PNG. For PDF conversion, please use a PDF converter tool.');
  } catch (error) {
    console.error('Error exporting canvas:', error);
    throw error;
  }
}

