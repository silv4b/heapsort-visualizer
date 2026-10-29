/**
 * Visualizador Didático de Heapsort e Árvore Heap
 * Mestrado em Estrutura de Dados
 */

class HeapVisualizer {
  constructor() {
    // Estado principal
    this.mode = 'max'; // 'max' (gera ordem decrescente) ou 'min' (gera ordem crescente)
    this.array = [45, 20, 35, 12, 18, 25, 30, 8, 10]; // array inicial padrão
    this.heapSize = this.array.length;
    this.sortedArray = [];

    // Histórico de passos para animação
    this.steps = [];
    this.currentStepIdx = 0;
    this.isPlaying = false;
    this.timer = null;
    this.speedMs = 700;

    // Cache de elementos DOM
    this.dom = {
      btnMaxHeap: document.getElementById('btnMaxHeap'),
      btnMinHeap: document.getElementById('btnMinHeap'),
      modeDescription: document.getElementById('modeDescription'),
      treeModeBadge: document.getElementById('treeModeBadge'),
      sortOrderTag: document.getElementById('sortOrderTag'),
      sortedOrderBadge: document.getElementById('sortedOrderBadge'),
      singleInsertForm: document.getElementById('singleInsertForm'),
      singleValueInput: document.getElementById('singleValueInput'),
      btnRandomArray: document.getElementById('btnRandomArray'),
      btnRebuildHeap: document.getElementById('btnRebuildHeap'),
      btnClear: document.getElementById('btnClear'),
      customArrayInput: document.getElementById('customArrayInput'),
      btnLoadCustomArray: document.getElementById('btnLoadCustomArray'),
      btnStartHeapsort: document.getElementById('btnStartHeapsort'),
      sortHintText: document.getElementById('sortHintText'),

      // Playback
      btnFirstStep: document.getElementById('btnFirstStep'),
      btnPrevStep: document.getElementById('btnPrevStep'),
      btnPlayPause: document.getElementById('btnPlayPause'),
      playPauseIcon: document.getElementById('playPauseIcon'),
      playPauseText: document.getElementById('playPauseText'),
      btnNextStep: document.getElementById('btnNextStep'),
      btnLastStep: document.getElementById('btnLastStep'),
      btnResetAnimation: document.getElementById('btnResetAnimation'),
      stepCounterBadge: document.getElementById('stepCounterBadge'),
      statusBadge: document.getElementById('statusBadge'),
      speedRange: document.getElementById('speedRange'),
      speedValueText: document.getElementById('speedValueText'),

      // Visualização do Array
      sortedArrayDisplay: document.getElementById('sortedArrayDisplay'),
      sortedCounter: document.getElementById('sortedCounter'),
      arrayDisplay: document.getElementById('arrayDisplay'),
      heapCounter: document.getElementById('heapCounter'),

      // Visualização da Árvore
      heapTreeSvg: document.getElementById('heapTreeSvg'),
      svgLinksGroup: document.getElementById('svgLinksGroup'),
      svgNodesGroup: document.getElementById('svgNodesGroup'),
      treeEmptyMessage: document.getElementById('treeEmptyMessage'),
      heapSizeStat: document.getElementById('heapSizeStat'),
      totalElementsStat: document.getElementById('totalElementsStat'),

      // Explicação e Pseudocódigo
      stepExplanation: document.getElementById('stepExplanation'),
      stepActionBadge: document.getElementById('stepActionBadge'),
      codeTabs: document.querySelectorAll('.code-tab-btn'),
      codeContents: document.querySelectorAll('.code-content')
    };

    this.initEventListeners();
    this.buildInitialHeap();
  }

  // =========================================================================
  // INICIALIZAÇÃO E EVENT LISTENERS
  // =========================================================================
  initEventListeners() {
    // Alternância Max-Heap / Min-Heap
    this.dom.btnMaxHeap.addEventListener('click', () => this.setMode('max'));
    this.dom.btnMinHeap.addEventListener('click', () => this.setMode('min'));

    // Inserção individual
    this.dom.singleInsertForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = parseInt(this.dom.singleValueInput.value, 10);
      if (!isNaN(val)) {
        this.insertElement(val);
        this.dom.singleValueInput.value = '';
      }
    });

    // Ações Rápidas
    this.dom.btnRandomArray.addEventListener('click', () => this.generateRandomArray());
    this.dom.btnRebuildHeap.addEventListener('click', () => this.rebuildHeapWithAnimation());
    this.dom.btnClear.addEventListener('click', () => this.clearAll());
    this.dom.btnLoadCustomArray.addEventListener('click', () => this.loadCustomArray());
    this.dom.btnStartHeapsort.addEventListener('click', () => this.runHeapsortAnimation());

    // Playback
    this.dom.btnPlayPause.addEventListener('click', () => this.togglePlayPause());
    this.dom.btnFirstStep.addEventListener('click', () => this.goToStep(0));
    this.dom.btnPrevStep.addEventListener('click', () => this.prevStep());
    this.dom.btnNextStep.addEventListener('click', () => this.nextStep());
    this.dom.btnLastStep.addEventListener('click', () => this.goToStep(this.steps.length - 1));
    this.dom.btnResetAnimation.addEventListener('click', () => this.goToStep(0));

    // Velocidade
    this.dom.speedRange.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      this.speedMs = 2200 - val;
      this.dom.speedValueText.textContent = `${(this.speedMs / 1000).toFixed(1)}s`;
      if (this.isPlaying) {
        this.pause();
        this.play();
      }
    });

    // Abas de Pseudocódigo
    this.dom.codeTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabTarget = tab.dataset.tab;
        this.switchCodeTab(tabTarget);
      });
    });

    // Ajuste de redimensionamento da janela para atualizar SVG
    window.addEventListener('resize', () => {
      if (this.steps.length > 0 && this.steps[this.currentStepIdx]) {
        this.renderStep(this.steps[this.currentStepIdx]);
      }
    });
  }

  // =========================================================================
  // MODO HEAP (MAX-HEAP vs MIN-HEAP)
  // =========================================================================
  setMode(newMode) {
    if (this.mode === newMode) return;
    this.mode = newMode;
    this.updateModeUI();
    this.rebuildHeapWithAnimation();
  }

  updateModeUI() {
    if (this.mode === 'max') {
      this.dom.btnMaxHeap.classList.add('active');
      this.dom.btnMinHeap.classList.remove('active');
      this.dom.treeModeBadge.textContent = 'Max-Heap';
      this.dom.sortOrderTag.textContent = 'Ordem Decrescente';
      this.dom.sortedOrderBadge.textContent = 'Ordem Decrescente (Maior → Menor)';
      this.dom.sortedOrderBadge.className = 'order-badge decrescente';
      this.dom.modeDescription.innerHTML = `<strong>Max-Heap:</strong> Cada pai é maior ou igual aos seus filhos. Extrai o maior elemento sucessivamente gerando ordem <strong>decrescente</strong>.`;
      this.dom.sortHintText.textContent = 'No Max-Heap, a extração sucessiva do maior elemento produz ordem DECRESCENTE.';
    } else {
      this.dom.btnMinHeap.classList.add('active');
      this.dom.btnMaxHeap.classList.remove('active');
      this.dom.treeModeBadge.textContent = 'Min-Heap';
      this.dom.sortOrderTag.textContent = 'Ordem Crescente';
      this.dom.sortedOrderBadge.textContent = 'Ordem Crescente (Menor → Maior)';
      this.dom.sortedOrderBadge.className = 'order-badge crescente';
      this.dom.modeDescription.innerHTML = `<strong>Min-Heap:</strong> Cada pai é menor ou igual aos seus filhos. Extrai o menor elemento sucessivamente gerando ordem <strong>crescente</strong>.`;
      this.dom.sortHintText.textContent = 'No Min-Heap, a extração sucessiva do menor elemento produz ordem CRESCENTE.';
    }
  }

  // Compara dois valores respeitando a propriedade do heap atual
  // Retorna verdadeiro se o candidato 'valChild' deve subir acima de 'valParent'
  violatesHeap(valChild, valParent) {
    if (this.mode === 'max') {
      return valChild > valParent; // No max-heap, filho não pode ser maior que o pai
    } else {
      return valChild < valParent; // No min-heap, filho não pode ser menor que o pai
    }
  }

  // Compara dois valores para escolher o prioritário (maior no max-heap, menor no min-heap)
  isBetter(val1, val2) {
    return this.mode === 'max' ? val1 > val2 : val1 < val2;
  }

  // =========================================================================
  // MANIPULAÇÃO DE DADOS INICIAIS
  // =========================================================================
  buildInitialHeap() {
    this.updateModeUI();
    this.rebuildHeapWithAnimation(false);
  }

  generateRandomArray() {
    this.pause();
    const count = 9;
    const newArr = [];
    while (newArr.length < count) {
      const num = Math.floor(Math.random() * 90) + 10;
      if (!newArr.includes(num)) newArr.push(num);
    }
    this.array = newArr;
    this.sortedArray = [];
    this.rebuildHeapWithAnimation();
  }

  loadCustomArray() {
    this.pause();
    const raw = this.dom.customArrayInput.value.trim();
    if (!raw) return;
    const parsed = raw.split(/[,;\s]+/)
      .map(x => parseInt(x, 10))
      .filter(x => !isNaN(x));

    if (parsed.length === 0) {
      alert('Por favor, informe números válidos separados por vírgula.');
      return;
    }
    if (parsed.length > 25) {
      alert('Para uma visualização clara da árvore na tela, recomendamos até 25 elementos.');
    }
    this.array = parsed.slice(0, 31);
    this.sortedArray = [];
    this.rebuildHeapWithAnimation();
  }

  clearAll() {
    this.pause();
    this.array = [];
    this.heapSize = 0;
    this.sortedArray = [];
    this.steps = [];
    this.currentStepIdx = 0;
    this.renderEmptyState();
    this.updateControls();
    this.dom.stepExplanation.innerHTML = `<p class="placeholder-text">Array limpo. Insira novos elementos para começar.</p>`;
    this.dom.stepActionBadge.textContent = 'Vazio';
    this.dom.statusBadge.textContent = 'Pronto';
    this.dom.statusBadge.className = 'badge badge-status';
  }

  // =========================================================================
  // GERADORES DE PASSOS (STEP RECORDING ENGINE)
  // =========================================================================

  // Inserção individual no Heap (com Sift-Up)
  insertElement(value) {
    this.pause();
    if (this.array.length >= 31) {
      alert('Limite de 31 nós atingido para manter a legibilidade visual da árvore.');
      return;
    }

    const steps = [];
    const A = [...this.array];
    const newIdx = A.length;
    A.push(value);
    const n = A.length;
    const currentSorted = [];

    // Passo 1: Anexar elemento ao final do array
    steps.push({
      heapArray: [...A],
      heapSize: n,
      sortedArray: [...currentSorted],
      totalElements: n,
      activeIndices: [newIdx],
      highlightType: 'insert',
      tab: 'siftup',
      codeLine: 'code-su-2',
      badge: 'Inserção',
      explanation: `Elemento <span class="highlight-val">${value}</span> inserido no final do array na posição <strong>índice [${newIdx}]</strong> (nova folha na árvore). Agora iniciamos o processo de <em>Sift-Up (Subir)</em> para restaurar a propriedade de <strong>${this.mode.toUpperCase()}-HEAP</strong>.`
    });

    // Processo de Sift-Up
    let curr = newIdx;
    while (curr > 0) {
      const parent = Math.floor((curr - 1) / 2);

      // Passo de Comparação
      steps.push({
        heapArray: [...A],
        heapSize: n,
        sortedArray: [...currentSorted],
        totalElements: n,
        activeIndices: [curr, parent],
        highlightType: 'compare',
        tab: 'siftup',
        codeLine: 'code-su-7',
        badge: 'Comparação',
        explanation: `Comparando o nó inserido no índice <strong>[${curr}]</strong> (valor <span class="highlight-val">${A[curr]}</span>) com seu pai no índice <strong>[${parent}]</strong> (valor <span class="highlight-val">${A[parent]}</span>).<br>Critério do ${this.mode.toUpperCase()}-HEAP: o filho deve ser ${this.mode === 'max' ? '≤' : '≥'} ao pai.`
      });

      if (this.violatesHeap(A[curr], A[parent])) {
        // Violação detectada -> Trocar
        const temp = A[curr];
        A[curr] = A[parent];
        A[parent] = temp;

        steps.push({
          heapArray: [...A],
          heapSize: n,
          sortedArray: [...currentSorted],
          totalElements: n,
          activeIndices: [curr, parent],
          highlightType: 'swap',
          tab: 'siftup',
          codeLine: 'code-su-8',
          badge: 'Troca (Sift-Up)',
          explanation: `Como o valor <span class="swap-val">${A[parent]}</span> viola a regra do ${this.mode.toUpperCase()}-Heap em relação a <span class="swap-val">${A[curr]}</span>, realizamos a <strong>troca</strong> entre índice [${curr}] e índice [${parent}].`
        });

        curr = parent;
      } else {
        steps.push({
          heapArray: [...A],
          heapSize: n,
          sortedArray: [...currentSorted],
          totalElements: n,
          activeIndices: [curr],
          highlightType: 'focus',
          tab: 'siftup',
          codeLine: 'code-su-10',
          badge: 'Propriedade Válida',
          explanation: `O valor <span class="sorted-val">${A[curr]}</span> não viola a propriedade do ${this.mode.toUpperCase()}-Heap em relação ao pai. O elemento estabilizou!`
        });
        break;
      }
    }

    steps.push({
      heapArray: [...A],
      heapSize: n,
      sortedArray: [...currentSorted],
      totalElements: n,
      activeIndices: [],
      highlightType: 'none',
      tab: 'siftup',
      codeLine: null,
      badge: 'Concluído',
      explanation: `Inserção do elemento <span class="highlight-val">${value}</span> concluída! A árvore permanece um <strong>${this.mode.toUpperCase()}-HEAP válido</strong>.`
    });

    this.array = A;
    this.sortedArray = currentSorted;
    this.loadSteps(steps);
    this.play();
  }

  // Construção do Heap: Build-Heap O(n)
  recordBuildHeapSteps(A, steps, total) {
    const n = A.length;
    steps.push({
      heapArray: [...A],
      heapSize: n,
      sortedArray: [],
      totalElements: total,
      activeIndices: [],
      highlightType: 'none',
      tab: 'heapsort',
      codeLine: 'code-hs-4',
      badge: 'Construir Heap',
      explanation: `Iniciando a fase <strong>Construir Heap (Build-Heap)</strong> com complexidade <strong>O(n)</strong>. Aplicaremos <em>Heapify</em> de baixo para cima, a partir do último nó não-folha: índice <strong>&lfloor;(${n}/2) - 1&rfloor; = ${Math.floor(n / 2) - 1}</strong> até o índice 0.`
    });

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
      this.recordHeapifySteps(A, n, i, steps, [], total, 'Construção do Heap');
    }

    steps.push({
      heapArray: [...A],
      heapSize: n,
      sortedArray: [],
      totalElements: total,
      activeIndices: [0],
      highlightType: 'focus',
      tab: 'heapsort',
      codeLine: 'code-hs-4',
      badge: 'Heap Construído',
      explanation: `Árvore transformada em um <strong>${this.mode.toUpperCase()}-HEAP</strong>! A raiz (índice 0) agora contém o elemento <strong>${this.mode === 'max' ? 'máximo' : 'mínimo'} global: ${A[0]}</strong>, pronto para ser extraído.`
    });
  }

  // Procedimento Heapify (Sift-Down / Descer)
  recordHeapifySteps(A, heapSize, i, steps, sortedArr, total, contextMsg = '') {
    let target = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    const children = [];
    if (left < heapSize) children.push(`Esquerdo [${left}]=${A[left]}`);
    if (right < heapSize) children.push(`Direito [${right}]=${A[right]}`);

    steps.push({
      heapArray: [...A.slice(0, heapSize)],
      heapSize: heapSize,
      sortedArray: [...sortedArr],
      totalElements: total,
      activeIndices: [i, ...(left < heapSize ? [left] : []), ...(right < heapSize ? [right] : [])],
      highlightType: 'compare',
      tab: 'heapify',
      codeLine: 'code-hf-2',
      badge: 'Heapify',
      explanation: `${contextMsg ? `<strong>${contextMsg}</strong> &bull; ` : ''}Avaliando subárvore com raiz no índice <strong>[${i}]</strong> (valor <span class="highlight-val">${A[i]}</span>). Filhos no heap: ${children.length > 0 ? children.join(', ') : 'Nenhum (folha)'}.`
    });

    // Comparação com filho esquerdo
    if (left < heapSize) {
      const leftBetter = this.isBetter(A[left], A[target]);
      steps.push({
        heapArray: [...A.slice(0, heapSize)],
        heapSize: heapSize,
        sortedArray: [...sortedArr],
        totalElements: total,
        activeIndices: [target, left],
        highlightType: 'compare',
        tab: 'heapify',
        codeLine: 'code-hf-4',
        badge: 'Comparar Filho Esq.',
        explanation: `Comparando alvo atual [${target}]=<span class="highlight-val">${A[target]}</span> com filho esquerdo [${left}]=<span class="highlight-val">${A[left]}</span>.<br>${leftBetter ? `O filho esquerdo é <strong>${this.mode === 'max' ? 'maior' : 'menor'}</strong>, tornando-se o novo alvo candidato!` : `O alvo atual permanece no índice [${target}].`}`
      });
      if (leftBetter) {
        target = left;
      }
    }

    // Comparação com filho direito
    if (right < heapSize) {
      const rightBetter = this.isBetter(A[right], A[target]);
      steps.push({
        heapArray: [...A.slice(0, heapSize)],
        heapSize: heapSize,
        sortedArray: [...sortedArr],
        totalElements: total,
        activeIndices: [target, right],
        highlightType: 'compare',
        tab: 'heapify',
        codeLine: 'code-hf-6',
        badge: 'Comparar Filho Dir.',
        explanation: `Comparando alvo atual [${target}]=<span class="highlight-val">${A[target]}</span> com filho direito [${right}]=<span class="highlight-val">${A[right]}</span>.<br>${rightBetter ? `O filho direito é <strong>${this.mode === 'max' ? 'maior' : 'menor'}</strong>, tornando-se o novo alvo candidato!` : `O alvo atual permanece no índice [${target}].`}`
      });
      if (rightBetter) {
        target = right;
      }
    }

    // Se o alvo não for a raiz da subárvore, troca e propaga para baixo
    if (target !== i) {
      const valOrig = A[i];
      const valTarget = A[target];
      const temp = A[i];
      A[i] = A[target];
      A[target] = temp;

      steps.push({
        heapArray: [...A.slice(0, heapSize)],
        heapSize: heapSize,
        sortedArray: [...sortedArr],
        totalElements: total,
        activeIndices: [i, target],
        highlightType: 'swap',
        tab: 'heapify',
        codeLine: 'code-hf-9',
        badge: 'Troca (Heapify)',
        explanation: `Como o ${this.mode === 'max' ? 'maior' : 'menor'} valor está no índice [${target}] (valor <span class="swap-val">${valTarget}</span>), realizamos a troca com o índice [${i}] (valor <span class="swap-val">${valOrig}</span>) e chamamos <code>heapify(A, n, ${target})</code> recursivamente.`
      });

      this.recordHeapifySteps(A, heapSize, target, steps, sortedArr, total, contextMsg);
    } else {
      steps.push({
        heapArray: [...A.slice(0, heapSize)],
        heapSize: heapSize,
        sortedArray: [...sortedArr],
        totalElements: total,
        activeIndices: [i],
        highlightType: 'focus',
        tab: 'heapify',
        codeLine: 'code-hf-8',
        badge: 'Subárvore Regularizada',
        explanation: `O nó no índice <strong>[${i}]</strong> satisfaz a propriedade do ${this.mode.toUpperCase()}-Heap em relação aos seus descendentes.`
      });
    }
  }

  // Execução Completa do Heapsort na ordem exata de extração
  runHeapsortAnimation() {
    this.pause();
    if (this.array.length <= 1) {
      alert('Insira pelo menos 2 elementos para ordenar com Heapsort.');
      return;
    }

    const steps = [];
    const A = [...this.array];
    const total = A.length;
    const sorted = [];

    const orderName = this.mode === 'max' ? 'DECRESCENTE (Maior → Menor)' : 'CRESCENTE (Menor → Maior)';

    steps.push({
      heapArray: [...A],
      heapSize: total,
      sortedArray: [],
      totalElements: total,
      activeIndices: [],
      highlightType: 'none',
      tab: 'heapsort',
      codeLine: 'code-hs-1',
      badge: 'Início Heapsort',
      explanation: `Iniciando a ordenação com <strong>Heapsort</strong> sobre <strong>${total} elementos</strong>.<br>No <strong>${this.mode.toUpperCase()}-HEAP</strong>, a extração sucessiva da raiz produz a ordenação na <strong>${orderName}</strong>.`
    });

    // Fase 1: Construção do Heap
    this.recordBuildHeapSteps(A, steps, total);

    // Fase 2: Extrações sucessivas da raiz na ordem em que é ordenado
    let currentHeapSize = total;
    while (currentHeapSize > 0) {
      const rootVal = A[0];

      // Passo 1: Destaca a raiz como o próximo elemento ordenado
      steps.push({
        heapArray: [...A.slice(0, currentHeapSize)],
        heapSize: currentHeapSize,
        sortedArray: [...sorted],
        totalElements: total,
        activeIndices: [0],
        highlightType: 'compare',
        tab: 'heapsort',
        codeLine: 'code-hs-7',
        badge: 'Extração da Raiz',
        explanation: `A raiz atual (índice 0, valor <span class="highlight-val">${rootVal}</span>) é o <strong>${this.mode === 'max' ? 'maior' : 'menor'}</strong> elemento restante no heap. Ela é extraída e enviada diretamente para o <strong>Array Sendo Ordenado</strong> na posição [${sorted.length}].`
      });

      // Passo 2: Insere no array ordenado
      sorted.push(rootVal);
      const newlySortedIndex = sorted.length - 1;

      if (currentHeapSize === 1) {
        // Último elemento extraído, o heap esvaziou
        currentHeapSize = 0;
        steps.push({
          heapArray: [],
          heapSize: 0,
          sortedArray: [...sorted],
          newlySortedIdx: newlySortedIndex,
          totalElements: total,
          activeIndices: [],
          highlightType: 'none',
          tab: 'heapsort',
          codeLine: 'code-hs-8',
          badge: 'Último Elemento',
          explanation: `O último elemento <span class="sorted-val">${rootVal}</span> foi inserido no array ordenado. O heap ativo esvaziou!`
        });
        break;
      }

      // Passo 3: Move o último elemento do heap ativo para a raiz
      const lastVal = A[currentHeapSize - 1];
      steps.push({
        heapArray: [...A.slice(0, currentHeapSize)],
        heapSize: currentHeapSize,
        sortedArray: [...sorted],
        newlySortedIdx: newlySortedIndex,
        totalElements: total,
        activeIndices: [currentHeapSize - 1],
        highlightType: 'swap',
        tab: 'heapsort',
        codeLine: 'code-hs-7',
        badge: 'Mover Última Folha',
        explanation: `Para manter a estrutura de árvore binária quase completa, a última folha no índice [${currentHeapSize - 1}] (valor <span class="swap-val">${lastVal}</span>) é movida para a raiz (índice 0). O tamanho do heap diminui para <strong>${currentHeapSize - 1}</strong>.`
      });

      A[0] = lastVal;
      currentHeapSize--;

      // Passo 4: Heap com a nova raiz antes do heapify
      steps.push({
        heapArray: [...A.slice(0, currentHeapSize)],
        heapSize: currentHeapSize,
        sortedArray: [...sorted],
        totalElements: total,
        activeIndices: [0],
        highlightType: 'compare',
        tab: 'heapsort',
        codeLine: 'code-hs-9',
        badge: 'Nova Raiz',
        explanation: `A nova raiz no índice 0 (valor <span class="highlight-val">${A[0]}</span>) pode violar a propriedade do heap. Executamos <code>heapify(A, ${currentHeapSize}, 0)</code> para descê-la.`
      });

      // Passo 5: Restaura o heap na raiz
      this.recordHeapifySteps(A, currentHeapSize, 0, steps, sorted, total, `Restaurando o heap após extração`);
    }

    // Conclusão
    steps.push({
      heapArray: [],
      heapSize: 0,
      sortedArray: [...sorted],
      totalElements: total,
      activeIndices: [],
      highlightType: 'none',
      tab: 'heapsort',
      codeLine: 'code-hs-8',
      badge: 'Concluído',
      explanation: `🎉 <strong>Ordenação Heapsort Concluída com Sucesso!</strong><br>O <strong>Array Sendo Ordenado</strong> foi preenchido na <strong>${orderName}</strong>. Complexidade total: <strong>O(n log n)</strong>.`
    });

    this.sortedArray = sorted;
    this.loadSteps(steps);
    this.play();
  }

  // Reconstrói apenas a propriedade do heap (com animação)
  rebuildHeapWithAnimation(autoPlay = true) {
    this.pause();
    if (this.array.length === 0) {
      this.clearAll();
      return;
    }

    const steps = [];
    const A = [...this.array];
    this.recordBuildHeapSteps(A, steps, A.length);

    this.array = A;
    this.sortedArray = [];
    this.loadSteps(steps);
    if (autoPlay) {
      this.play();
    } else {
      this.goToStep(steps.length - 1);
    }
  }

  // =========================================================================
  // GERENCIAMENTO DE PASSOS E REPRODUÇÃO
  // =========================================================================
  loadSteps(steps) {
    this.steps = steps;
    this.currentStepIdx = 0;
    this.updateControls();
    if (this.steps.length > 0) {
      this.renderStep(this.steps[0]);
    }
  }

  play() {
    if (this.isPlaying) return;
    if (this.currentStepIdx >= this.steps.length - 1) {
      this.currentStepIdx = 0;
    }
    this.isPlaying = true;
    this.updatePlayPauseBtn();
    this.dom.statusBadge.textContent = 'Executando...';
    this.dom.statusBadge.className = 'badge badge-status active';

    this.timer = setInterval(() => {
      if (this.currentStepIdx < this.steps.length - 1) {
        this.nextStep(false);
      } else {
        this.pause();
        this.dom.statusBadge.textContent = 'Concluído';
        this.dom.statusBadge.className = 'badge badge-status complete';
      }
    }, this.speedMs);
  }

  pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    clearInterval(this.timer);
    this.timer = null;
    this.updatePlayPauseBtn();
    if (this.currentStepIdx < this.steps.length - 1) {
      this.dom.statusBadge.textContent = 'Pausado';
      this.dom.statusBadge.className = 'badge badge-status';
    }
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  nextStep(userAction = true) {
    if (userAction) this.pause();
    if (this.currentStepIdx < this.steps.length - 1) {
      this.currentStepIdx++;
      this.renderStep(this.steps[this.currentStepIdx]);
      this.updateControls();
    }
  }

  prevStep() {
    this.pause();
    if (this.currentStepIdx > 0) {
      this.currentStepIdx--;
      this.renderStep(this.steps[this.currentStepIdx]);
      this.updateControls();
    }
  }

  goToStep(index) {
    this.pause();
    if (index >= 0 && index < this.steps.length) {
      this.currentStepIdx = index;
      this.renderStep(this.steps[this.currentStepIdx]);
      this.updateControls();
    }
  }

  updateControls() {
    const total = this.steps.length;
    const curr = total === 0 ? 0 : this.currentStepIdx + 1;
    this.dom.stepCounterBadge.textContent = `Passo ${curr} / ${total}`;

    this.dom.btnFirstStep.disabled = total <= 1 || this.currentStepIdx === 0;
    this.dom.btnPrevStep.disabled = total <= 1 || this.currentStepIdx === 0;
    this.dom.btnNextStep.disabled = total <= 1 || this.currentStepIdx === total - 1;
    this.dom.btnLastStep.disabled = total <= 1 || this.currentStepIdx === total - 1;
    this.dom.btnResetAnimation.disabled = total <= 1;

    this.updatePlayPauseBtn();
  }

  updatePlayPauseBtn() {
    if (this.isPlaying) {
      this.dom.playPauseIcon.textContent = '⏸';
      this.dom.playPauseText.textContent = 'Pausar';
    } else {
      this.dom.playPauseIcon.textContent = '▶';
      this.dom.playPauseText.textContent = 'Reproduzir';
    }
  }

  switchCodeTab(tabId) {
    this.dom.codeTabs.forEach(t => {
      t.classList.toggle('active', t.dataset.tab === tabId);
    });
    this.dom.codeContents.forEach(c => {
      c.classList.toggle('active', c.id === `tabContent-${tabId}`);
    });
  }

  highlightCodeLine(tabId, lineId) {
    if (tabId) {
      this.switchCodeTab(tabId);
    }
    document.querySelectorAll('.code-line.active-line').forEach(el => {
      el.classList.remove('active-line');
    });
    if (lineId) {
      const lineEl = document.getElementById(lineId);
      if (lineEl) {
        lineEl.classList.add('active-line');
      }
    }
  }

  // =========================================================================
  // RENDERIZAÇÃO VISUAL: ARRAY + SVG DA ÁRVORE HEAP
  // =========================================================================
  renderStep(step) {
    if (!step) return;

    const {
      heapArray = [],
      heapSize = 0,
      sortedArray = [],
      newlySortedIdx = null,
      totalElements = heapArray.length + sortedArray.length,
      activeIndices = [],
      highlightType = 'none',
      tab,
      codeLine,
      badge,
      explanation
    } = step;

    // 1. Atualiza Explicação e Pseudocódigo
    this.dom.stepExplanation.innerHTML = `<p>${explanation}</p>`;
    this.dom.stepActionBadge.textContent = badge || 'Execução';
    this.highlightCodeLine(tab, codeLine);

    // 2. Atualiza Contadores
    this.dom.heapSizeStat.textContent = heapSize;
    this.dom.totalElementsStat.textContent = totalElements;
    this.dom.heapCounter.textContent = `${heapSize} elemento${heapSize === 1 ? '' : 's'} ativo${heapSize === 1 ? '' : 's'}`;
    this.dom.sortedCounter.textContent = `${sortedArray.length} / ${totalElements} ordenado${sortedArray.length === 1 ? '' : 's'}`;

    // 3. Renderiza o Array Sendo Ordenado na ordem de extração
    this.renderSortedArray(sortedArray, totalElements, newlySortedIdx);

    // 4. Renderiza o Array do Heap Ativo
    this.renderHeapArray(heapArray, heapSize, activeIndices, highlightType);

    // 5. Renderiza a Árvore Binária em SVG
    this.renderTreeSvg(heapArray, heapSize, activeIndices, highlightType);
  }

  renderEmptyState() {
    this.dom.sortedArrayDisplay.innerHTML = `<span class="empty-order-msg">Nenhum elemento no array.</span>`;
    this.dom.arrayDisplay.innerHTML = '';
    this.dom.svgLinksGroup.innerHTML = '';
    this.dom.svgNodesGroup.innerHTML = '';
    this.dom.treeEmptyMessage.style.display = 'flex';
    this.dom.heapSizeStat.textContent = '0';
    this.dom.totalElementsStat.textContent = '0';
    this.dom.heapCounter.textContent = '0 elementos';
    this.dom.sortedCounter.textContent = '0 / 0 ordenados';
  }

  // Render do Array Sendo Ordenado (Ordem Exata da Extração do Heapsort)
  renderSortedArray(sortedArray, totalElements, newlySortedIdx) {
    const container = this.dom.sortedArrayDisplay;
    container.innerHTML = '';

    if (totalElements === 0) {
      container.innerHTML = `<span class="empty-order-msg">Array vazio.</span>`;
      return;
    }

    if (sortedArray.length === 0) {
      container.innerHTML = `<span class="empty-order-msg">Aguardando início da ordenação (clique em ⚡ Executar Heapsort)...</span>`;
      return;
    }

    // Renderiza cada elemento ordenado na ordem exata de saída
    for (let i = 0; i < totalElements; i++) {
      const cell = document.createElement('div');
      cell.className = 'array-cell';

      if (i < sortedArray.length) {
        const val = sortedArray[i];
        cell.classList.add('sorted');
        if (i === newlySortedIdx) {
          cell.classList.add('newly-sorted');
        }

        cell.innerHTML = `
          <span class="cell-role" style="color: #34d399;">#${i + 1}</span>
          <div class="cell-box">${val}</div>
          <div class="cell-index">[${i}]</div>
        `;
      } else {
        // Slot vazio aguardando os próximos elementos a serem extraídos
        cell.classList.add('empty-slot');
        cell.innerHTML = `
          <div class="cell-box">&hellip;</div>
          <div class="cell-index">[${i}]</div>
        `;
      }

      container.appendChild(cell);
    }
  }

  // Render do Array do Heap Ativo (Mapeado 1:1 com a Árvore Binária)
  renderHeapArray(array, heapSize, activeIndices = [], highlightType = 'none') {
    const container = this.dom.arrayDisplay;
    container.innerHTML = '';

    if (heapSize === 0) {
      container.innerHTML = `<span class="empty-order-msg">Todos os elementos foram extraídos e ordenados! O heap está vazio.</span>`;
      return;
    }

    for (let idx = 0; idx < heapSize; idx++) {
      const val = array[idx];
      const cell = document.createElement('div');
      cell.className = 'array-cell';

      // Estados de destaque
      const isActive = activeIndices.includes(idx);
      if (isActive) {
        if (highlightType === 'compare' || highlightType === 'insert') cell.classList.add('comparing');
        else if (highlightType === 'swap') cell.classList.add('swapping');
      }

      if (idx === 0) {
        cell.classList.add('root');
      }

      let roleHtml = '';
      if (idx === 0) {
        roleHtml = `<span class="cell-role">RAIZ</span>`;
      }

      cell.innerHTML = `
        ${roleHtml}
        <div class="cell-box">${val}</div>
        <div class="cell-index">[${idx}]</div>
      `;

      container.appendChild(cell);
    }
  }

  // Render da Árvore Binária no SVG
  renderTreeSvg(array, heapSize, activeIndices = [], highlightType = 'none') {
    const n = heapSize;
    if (n === 0) {
      this.dom.treeEmptyMessage.style.display = 'flex';
      this.dom.treeEmptyMessage.querySelector('p').textContent = 'O heap ativo foi completamente esvaziado durante a ordenação.';
      this.dom.svgLinksGroup.innerHTML = '';
      this.dom.svgNodesGroup.innerHTML = '';
      return;
    }
    this.dom.treeEmptyMessage.style.display = 'none';

    // Determina profundidade máxima e dimensões do SVG
    const maxDepth = Math.floor(Math.log2(n));
    const containerWidth = Math.max(680, Math.pow(2, maxDepth) * 60);
    const containerHeight = Math.max(380, (maxDepth + 1) * 85 + 40);

    const svg = this.dom.heapTreeSvg;
    svg.setAttribute('viewBox', `0 0 ${containerWidth} ${containerHeight}`);

    // Cálculo das posições (x, y) de cada nó
    const positions = [];
    const levelHeight = 78;
    const topMargin = 50;

    for (let i = 0; i < n; i++) {
      const depth = Math.floor(Math.log2(i + 1));
      const posInLevel = i - (Math.pow(2, depth) - 1);
      const totalInLevel = Math.pow(2, depth);

      const slotWidth = containerWidth / totalInLevel;
      const x = slotWidth * (posInLevel + 0.5);
      const y = topMargin + depth * levelHeight;

      positions.push({ x, y, depth });
    }

    // 1. Renderiza Arestas (Links)
    let linksHtml = '';
    for (let i = 0; i < n; i++) {
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      const parentPos = positions[i];

      [left, right].forEach(childIdx => {
        if (childIdx < n) {
          const childPos = positions[childIdx];
          const isEdgeActive = activeIndices.includes(i) && activeIndices.includes(childIdx);
          const edgeClass = isEdgeActive ? 'tree-link link-active' : 'tree-link';

          linksHtml += `
            <line x1="${parentPos.x}" y1="${parentPos.y}" 
                  x2="${childPos.x}" y2="${childPos.y}" 
                  class="${edgeClass}" />
          `;
        }
      });
    }
    this.dom.svgLinksGroup.innerHTML = linksHtml;

    // 2. Renderiza Nós
    let nodesHtml = '';
    for (let i = 0; i < n; i++) {
      const pos = positions[i];
      const val = array[i];
      const isActive = activeIndices.includes(i);

      let nodeClass = 'tree-node-group node-normal';

      if (isActive) {
        if (highlightType === 'compare' || highlightType === 'insert') {
          nodeClass = 'tree-node-group node-compare';
        } else if (highlightType === 'swap') {
          nodeClass = 'tree-node-group node-swap';
        }
      }

      const radius = 22;

      let rootLabelHtml = '';
      if (i === 0) {
        rootLabelHtml = `<text x="${pos.x}" y="${pos.y - radius - 6}" class="tree-node-label-root">RAIZ</text>`;
      }

      nodesHtml += `
        <g class="${nodeClass}" transform="translate(0, 0)">
          ${rootLabelHtml}
          <circle cx="${pos.x}" cy="${pos.y}" r="${radius}" class="tree-node-circle"></circle>
          <text x="${pos.x}" y="${pos.y - 1}" class="tree-node-text-val">${val}</text>
          <text x="${pos.x}" y="${pos.y + radius + 13}" class="tree-node-text-idx">[${i}]</text>
        </g>
      `;
    }
    this.dom.svgNodesGroup.innerHTML = nodesHtml;
  }
}

// Inicializa a aplicação assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.heapVisualizer = new HeapVisualizer();
});
