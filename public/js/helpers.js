// ==========================================
// FUNÇÕES AUXILIARES GLOBAIS
// ==========================================

// Função para exibir notificações
function showNotification(message, type = 'info') {
  const notificationContainer = document.getElementById('notificationContainer');
  
  if (!notificationContainer) {
    // Criar container se não existir
    const container = document.createElement('div');
    container.id = 'notificationContainer';
    container.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 3000; max-width: 400px;';
    document.body.appendChild(container);
  }
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.innerHTML = `
    ${message}
    <span class="alert-close" onclick="this.parentElement.remove();">&times;</span>
  `;
  
  document.getElementById('notificationContainer').appendChild(alert);
  
  // Auto remover após 5 segundos
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

// Fechar modal clicando no X ou fora do modal
function setupModalClosers() {
  const modals = document.querySelectorAll('.modal');
  
  modals.forEach(modal => {
    // Fechar ao clicar no X
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }
    
    // Fechar ao clicar fora do modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
    
    // Fechar ao pressionar ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        modal.classList.remove('active');
      }
    });
  });
}

// Formatar moeda
function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Formatar data
function formatDate(date) {
  if (date instanceof firebase.firestore.Timestamp) {
    date = date.toDate();
  }
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

// Calcular dias de atraso
function calculateDaysOverdue(date) {
  if (date instanceof firebase.firestore.Timestamp) {
    date = date.toDate();
  }
  
  const today = new Date();
  const dueDate = new Date(date);
  const diffTime = today - dueDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}

// Validar email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validar telefone
function isValidPhone(phone) {
  const re = /^[\d\s\-()]+$/;
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Toggle sidebar (mobile)
function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) {
    sidebar.classList.toggle('active');
  }
}

// Confirmar ação
function confirmAction(message = 'Tem certeza que deseja realizar esta ação?') {
  return confirm(message);
}

// Exportar dados para CSV
function exportToCSV(data, filename = 'export.csv') {
  if (!data || data.length === 0) {
    showNotification('Nenhum dado para exportar', 'warning');
    return;
  }
  
  // Obter headers
  const headers = Object.keys(data[0]);
  const csv = [headers.join(',')];
  
  // Adicionar dados
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header];
      // Escapar valores com vírgulas ou aspas
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csv.push(values.join(','));
  });
  
  // Criar e fazer download
  const csvContent = csv.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('Dados exportados com sucesso', 'success');
}

// Imprimir tabela
function printTable(tableId, title = 'Relatório') {
  const table = document.getElementById(tableId);
  if (!table) {
    showNotification('Tabela não encontrada', 'danger');
    return;
  }
  
  const printWindow = window.open('', '', 'height=600,width=800');
  printWindow.document.write('<html><head><title>' + title + '</title>');
  printWindow.document.write('<link rel="stylesheet" href="/css/styles.css">');
  printWindow.document.write('<style>');
  printWindow.document.write('body { font-family: Arial, sans-serif; margin: 20px; }');
  printWindow.document.write('h1 { color: #004e89; }');
  printWindow.document.write('table { width: 100%; border-collapse: collapse; }');
  printWindow.document.write('th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }');
  printWindow.document.write('th { background-color: #004e89; color: white; }');
  printWindow.document.write('</style></head><body>');
  printWindow.document.write('<h1>' + title + '</h1>');
  printWindow.document.write(table.outerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  printWindow.print();
}

// Inicializar tooltips
function initTooltips() {
  const tooltips = document.querySelectorAll('[data-tooltip]');
  tooltips.forEach(el => {
    el.addEventListener('mouseenter', (e) => {
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = el.getAttribute('data-tooltip');
      tooltip.style.cssText = `
        position: absolute;
        background: #333;
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 1000;
        white-space: nowrap;
      `;
      document.body.appendChild(tooltip);
      
      const rect = el.getBoundingClientRect();
      tooltip.style.top = (rect.top - tooltip.offsetHeight - 5) + 'px';
      tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
      
      el.addEventListener('mouseleave', () => tooltip.remove(), { once: true });
    });
  });
}

// Debounce para busca
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Inicializar ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  setupModalClosers();
  initTooltips();
  
  // Verificar se Firebase está disponível
  if (typeof firebase === 'undefined') {
    console.error('Firebase não foi carregado');
  }
});

// Tratamento global de erros
window.addEventListener('error', (event) => {
  console.error('Erro não capturado:', event.error);
});

// Tratamento de erros não capturados em promises
window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rejeitada não tratada:', event.reason);
});
