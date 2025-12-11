/**
 * Utilidades para exportação de PDFs
 * Sistema modular para exportação de relatórios em PDF
 */

export interface PDFHeader {
  title: string;
  subtitle?: string;
  patientName?: string;
  reportDate?: string;
  additionalInfo?: string[];
}

export interface PDFMetric {
  value: string | number;
  label: string;
  color?: string;
}

export interface PDFSection {
  title: string;
  content: string;
  type?: 'text' | 'table' | 'chart' | 'list';
}

export interface PDFChartData {
  type: 'pie' | 'donut' | 'bar';
  title: string;
  data: Array<Record<string, unknown>>;
  colors?: string[];
  options?: {
    showLegend?: boolean;
    showValues?: boolean;
    centerText?: string;
  };
}

export interface PDFExportOptions {
  header: PDFHeader;
  metrics?: PDFMetric[];
  sections?: PDFSection[];
  charts?: PDFChartData[];
  evolutionData?: Array<Record<string, unknown>>;
  customStyles?: string;
  autoprint?: boolean;
}

export class PDFExporter {
  private static defaultColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#06B6D4', '#6B7280', '#EC4899',
    '#14B8A6', '#F97316'
  ];

  /**
   * Gera o CSS base para o PDF
   */
  private static generateBaseCSS(): string {
    return `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Arial', sans-serif;
        line-height: 1.6;
        color: #333;
        padding: 20px;
        background: #fff;
      }
      
      .header {
        text-align: center;
        margin-bottom: 30px;
        border-bottom: 3px solid #2563eb;
        padding-bottom: 20px;
      }
      
      .header h1 {
        color: #2563eb;
        font-size: 28px;
        margin-bottom: 10px;
      }
      
      .header p {
        color: #666;
        font-size: 16px;
        margin-bottom: 5px;
      }
      
      .info-section {
        background: #f8fafc;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 30px;
        border-left: 4px solid #2563eb;
      }
      
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .metric-card {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      }
      
      .metric-value {
        font-size: 32px;
        font-weight: bold;
        color: #2563eb;
        margin-bottom: 5px;
      }
      
      .metric-label {
        font-size: 14px;
        color: #666;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .section {
        margin-bottom: 30px;
      }
      
      .section-title {
        font-size: 20px;
        color: #1f2937;
        margin-bottom: 15px;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 5px;
      }
      
      .chart-container {
        display: flex;
        gap: 30px;
        align-items: flex-start;
        margin-bottom: 20px;
      }
      
      .chart-visual {
        flex: 1;
      }
      
      .chart-legend {
        flex: 1;
      }
      
      .legend-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        margin-bottom: 8px;
        background: #f9fafb;
        border-radius: 6px;
        border-left: 4px solid #2563eb;
      }
      
      .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 8px;
      }
      
      .evolution-item {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 20px;
        margin-bottom: 15px;
        page-break-inside: avoid;
      }
      
      .evolution-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15px;
        border-bottom: 1px solid #f3f4f6;
        padding-bottom: 10px;
      }
      
      .evolution-type {
        background: #dbeafe;
        color: #1e40af;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }
      
      .evolution-date {
        color: #666;
        font-size: 14px;
      }
      
      .evolution-text {
        color: #374151;
        line-height: 1.8;
        margin-bottom: 10px;
      }
      
      .evolution-professional {
        font-size: 12px;
        color: #6b7280;
        font-style: italic;
      }
      
      .page-break {
        page-break-before: always;
      }
      
      .no-data {
        text-align: center;
        color: #6b7280;
        font-style: italic;
        padding: 40px;
        background: #f9fafb;
        border-radius: 8px;
      }
      
      .footer {
        margin-top: 50px;
        text-align: center;
        color: #6b7280;
        font-size: 12px;
        border-top: 1px solid #e5e7eb;
        padding-top: 20px;
      }
      
      @media print {
        body { padding: 10px; }
        .metrics-grid { grid-template-columns: repeat(2, 1fr); }
        .chart-container { flex-direction: column; gap: 15px; }
      }
    `;
  }

  /**
   * Gera SVG para gráfico de pizza
   */
  private static generatePieChart(data: Array<Record<string, unknown>>, colors: string[], title: string): string {
    if (data.length === 0) return '';

    const total = data.reduce((sum, item) => sum + item.quantidade, 0);
    const svgElements: string[] = [];
    let cumulativePercentage = 0;

    data.forEach((item, index) => {
      const percentage = (item.quantidade / total) * 100;
      const color = colors[index % colors.length];
      
      const radius = 80;
      const centerX = 100;
      const centerY = 100;
      
      const startAngle = (cumulativePercentage / 100) * 360 - 90;
      const endAngle = ((cumulativePercentage + percentage) / 100) * 360 - 90;
      
      const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
      const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
      const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
      const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
      
      const largeArc = percentage > 50 ? 1 : 0;
      
      const pathData = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      svgElements.push(`<path d="${pathData}" fill="${color}" stroke="white" stroke-width="2"/>`);
      cumulativePercentage += percentage;
    });

    return `
      <div class="section">
        <h2 class="section-title">${title}</h2>
        <div class="chart-container">
          <div class="chart-visual">
            <svg width="250" height="250" viewBox="0 0 200 200" style="display: block; margin: 0 auto;">
              ${svgElements.join('')}
            </svg>
          </div>
          <div class="chart-legend">
            ${data.map((item, index) => {
              const percentage = ((item.quantidade / total) * 100).toFixed(1);
              const color = colors[index % colors.length];
              return `
                <div class="legend-item">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="legend-color" style="background-color: ${color};"></div>
                    <strong>${item.label || item.nome || item.tipo}</strong>
                  </div>
                  <div>
                    <strong>${item.quantidade}</strong> (${percentage}%)
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Gera SVG para gráfico de rosca (donut)
   */
  private static generateDonutChart(data: Array<Record<string, unknown>>, colors: string[], title: string, centerText?: string): string {
    if (data.length === 0) return '';

    const total = data.reduce((sum, item) => sum + item.quantidade, 0);
    const svgElements: string[] = [];
    let cumulativePercentage = 0;

    data.forEach((item, index) => {
      const percentage = (item.quantidade / total) * 100;
      const color = colors[index % colors.length];
      
      const outerRadius = 80;
      const innerRadius = 45;
      const centerX = 100;
      const centerY = 100;
      
      const startAngle = (cumulativePercentage / 100) * 360 - 90;
      const endAngle = ((cumulativePercentage + percentage) / 100) * 360 - 90;
      
      const x1Outer = centerX + outerRadius * Math.cos((startAngle * Math.PI) / 180);
      const y1Outer = centerY + outerRadius * Math.sin((startAngle * Math.PI) / 180);
      const x2Outer = centerX + outerRadius * Math.cos((endAngle * Math.PI) / 180);
      const y2Outer = centerY + outerRadius * Math.sin((endAngle * Math.PI) / 180);
      
      const x1Inner = centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180);
      const y1Inner = centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180);
      const x2Inner = centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180);
      const y2Inner = centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180);
      
      const largeArc = percentage > 50 ? 1 : 0;
      
      const pathData = [
        `M ${x1Outer} ${y1Outer}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2Outer} ${y2Outer}`,
        `L ${x2Inner} ${y2Inner}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1Inner} ${y1Inner}`,
        'Z'
      ].join(' ');

      svgElements.push(`<path d="${pathData}" fill="${color}" stroke="white" stroke-width="2"/>`);
      cumulativePercentage += percentage;
    });

    const centerDisplay = centerText || total.toString();

    return `
      <div class="section">
        <h2 class="section-title">${title}</h2>
        <div class="chart-container">
          <div class="chart-visual">
            <svg width="250" height="250" viewBox="0 0 200 200" style="display: block; margin: 0 auto;">
              ${svgElements.join('')}
              <text x="100" y="95" text-anchor="middle" style="font-size: 14px; font-weight: bold; fill: #374151;">Total</text>
              <text x="100" y="110" text-anchor="middle" style="font-size: 20px; font-weight: bold; fill: #2563eb;">${centerDisplay}</text>
            </svg>
          </div>
          <div class="chart-legend">
            ${data.map((item, index) => {
              const percentage = ((item.quantidade / total) * 100).toFixed(1);
              const color = colors[index % colors.length];
              return `
                <div class="legend-item">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <div class="legend-color" style="background-color: ${color};"></div>
                    <strong>${item.label || item.nome || item.tipo}</strong>
                  </div>
                  <div>
                    <strong>${item.quantidade}</strong> (${percentage}%)
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Gera SVG para gráfico de barras
   */
  private static generateBarChart(data: Array<Record<string, unknown>>, colors: string[], title: string): string {
    if (data.length === 0) return '';

    const maxValue = Math.max(...data.map(item => item.quantidade));
    const barElements: string[] = [];

    // Grid lines
    const gridLines = [0, 25, 50, 75, 100].map(percentage => {
      const y = 200 - (percentage / 100) * 150;
      const value = Math.ceil((percentage / 100) * maxValue);
      return `
        <line x1="50" y1="${y}" x2="${data.length * 60 + 50}" y2="${y}" stroke="#d1d5db" stroke-dasharray="3,3" stroke-width="1"/>
        <text x="40" y="${y + 4}" text-anchor="end" style="font-size: 10px; fill: #6b7280;">${value}</text>
      `;
    }).join('');

    // Bars
    data.forEach((item, index) => {
      const height = (item.quantidade / maxValue) * 150;
      const color = colors[index % colors.length];
      const x = 60 + index * 60;
      const y = 200 - height;
      
      barElements.push(`
        <rect x="${x}" y="${y}" width="40" height="${height}" fill="${color}" rx="4" ry="4"/>
        <text x="${x + 20}" y="${y - 5}" text-anchor="middle" style="font-size: 12px; font-weight: bold; fill: #374151;">${item.quantidade}</text>
        <text x="${x + 20}" y="220" text-anchor="middle" style="font-size: 10px; fill: #6b7280;">${item.label}</text>
        <text x="${x + 20}" y="235" text-anchor="middle" style="font-size: 9px; fill: #9ca3af;">${item.sublabel || ''}</text>
      `);
    });

    return `
      <div class="section">
        <h2 class="section-title">${title}</h2>
        <div style="margin: 30px 0; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: linear-gradient(to bottom, #f0f9ff, #ffffff);">
          <svg width="100%" height="300" viewBox="0 0 ${data.length * 60 + 100} 250" style="display: block;">
            ${gridLines}
            ${barElements.join('')}
          </svg>
        </div>
      </div>
    `;
  }

  /**
   * Função principal para exportar PDF
   */
  static export(options: PDFExportOptions): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const {
      header,
      metrics = [],
      sections = [],
      charts = [],
      evolutionData = [],
      customStyles = '',
      autoprint = true
    } = options;

    // Gerar HTML do cabeçalho
    const headerHTML = `
      <div class="header">
        <h1>${header.title}</h1>
        ${header.subtitle ? `<p><strong>${header.subtitle}</strong></p>` : ''}
        ${header.patientName ? `<p><strong>Paciente:</strong> ${header.patientName}</p>` : ''}
        <p><strong>Relatório gerado em:</strong> ${header.reportDate || new Date().toLocaleString('pt-BR')}</p>
        ${header.additionalInfo ? header.additionalInfo.map(info => `<p>${info}</p>`).join('') : ''}
      </div>
    `;

    // Gerar métricas
    const metricsHTML = metrics.length > 0 ? `
      <div class="section">
        <h2 class="section-title">Métricas Principais</h2>
        <div class="metrics-grid">
          ${metrics.map(metric => `
            <div class="metric-card">
              <div class="metric-value" ${metric.color ? `style="color: ${metric.color};"` : ''}>${metric.value}</div>
              <div class="metric-label">${metric.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
    ` : '';

    // Gerar gráficos
    const chartsHTML = charts.map(chart => {
      const colors = chart.colors || this.defaultColors;
      switch (chart.type) {
        case 'pie':
          return this.generatePieChart(chart.data, colors, chart.title);
        case 'donut':
          return this.generateDonutChart(chart.data, colors, chart.title, chart.options?.centerText);
        case 'bar':
          return this.generateBarChart(chart.data, colors, chart.title);
        default:
          return '';
      }
    }).join('');

    // Gerar seções customizadas
    const sectionsHTML = sections.map(section => `
      <div class="section">
        <h2 class="section-title">${section.title}</h2>
        <div>${section.content}</div>
      </div>
    `).join('');

    // Gerar dados de evolução
    const evolutionHTML = evolutionData.length > 0 ? `
      <div class="page-break"></div>
      <div class="section">
        <h2 class="section-title">Histórico Detalhado (${evolutionData.length})</h2>
        ${evolutionData.map((item, index) => `
          <div class="evolution-item">
            <div class="evolution-header">
              <div class="evolution-type">${item.tipo || item.type || 'Registro'}</div>
              <div class="evolution-date">
                <strong>#${evolutionData.length - index}</strong><br>
                ${item.data || item.date || ''}
              </div>
            </div>
            <div class="evolution-text">
              ${(item.texto || item.text || '').replace(/\n/g, '<br>')}
            </div>
            <div class="evolution-professional">
              ${item.profissional || item.professional || ''}
            </div>
          </div>
        `).join('')}
      </div>
    ` : '';

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${header.title}</title>
    <style>
        ${this.generateBaseCSS()}
        ${customStyles}
    </style>
</head>
<body>
    ${headerHTML}
    ${metricsHTML}
    ${chartsHTML}
    ${sectionsHTML}
    ${evolutionHTML}

    <div class="footer">
        <p>Relatório gerado automaticamente pelo Sistema de Gestão Clínica</p>
        <p>Data de geração: ${new Date().toLocaleString('pt-BR')}</p>
    </div>

    ${autoprint ? `
    <script>
        window.onload = function() {
            setTimeout(() => {
                window.print();
            }, 500);
        };
    </script>
    ` : ''}
</body>
</html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  /**
   * Utilitário para formatação de data padrão
   */
  static formatDate(dateISO: string): string {
    const data = new Date(dateISO);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Sao_Paulo",
    });
  }

  /**
   * Utilitário para formatação de data simples
   */
  static formatSimpleDate(dateISO: string): string {
    const data = new Date(dateISO);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "America/Sao_Paulo",
    });
  }
}

export default PDFExporter;
