# Arcade JS - Portal de Jogos Clássicos
**Colégio ULBRA São Lucas - Curso Técnico em Informática**
**Projeto desenvolvido para o módulo de Lógica e Programação Web**

---

## Sobre o Projeto

Este portal é uma coleção de jogos clássicos desenvolvidos em ambiente web para exercitar a lógica de programação e a manipulação dinâmica de elementos da página sem a necessidade de recarregamento (Single Page Application feel).

### Jogos Disponíveis

* **Jokenpô (Pedra, Papel ou Tesoura)**: Desafio de estratégia contra a Inteligência Artificial.
* **Batalha de Dados**: Um teste de sorte pura onde vence quem tirar o maior número no dado.
* **Cara ou Coroa**: Escolha entre cara ou coroa e veja se o sorteio do sistema coincide com a sua aposta.
* **BlackJack**: Chegue ao 21 sem estourar. Vença o dealer.

---

## Projetos Avaliativos

### 💡 Projeto 1 — Controle de Luz

Simulador de interruptor que liga e desliga uma lâmpada virtual, com cenário completo de quarto que muda junto com o estado da luz.

**Funcionalidades implementadas:**
- [x] Lâmpada com dois estados visuais (acesa e apagada)
- [x] Botão que muda o texto dinamicamente entre "LIGAR" e "DESLIGAR"
- [x] Cenário de quarto que altera cores junto com a luz
- [x] Contador de vezes que a luz foi acesa
- [x] Personagem animado que reage ao estado da luz

**Como funciona o `classList.toggle()`:**

O `classList.toggle()` adiciona uma classe CSS se ela não existir no elemento, ou a remove se já existir — tudo em uma única linha. Neste projeto ele é usado para ativar o estado visual do interruptor:

```js
$('toggle').classList.add('on');    // liga — adiciona a classe
$('toggle').classList.remove('on'); // desliga — remove a classe
```

É ideal para qualquer situação de liga/desliga: menus, modais, temas escuros, etc.

**Como modificar a imagem usada:**

A lâmpada é desenhada com SVG inline. Para substituir por uma imagem externa, localize a tag `<svg class="lamp-svg">` no `controleLuz.html` e substitua por:

```html
<img src="sua-lampada-acesa.png" id="lampImg" width="60" />
```

Depois ajuste as funções `ligar()` e `desligar()` no JS para trocar o `src` da imagem em vez de manipular os atributos SVG.

---

### 🪙 Projeto 2 — Cofrinho Digital

Simulador de economia que permite adicionar moedas fictícias, acompanhar o saldo e realizar saques.

**Funcionalidades implementadas:**
- [x] Botões para adicionar R$0,10 / R$0,25 / R$0,50 / R$1,00
- [x] Total formatado com `Intl.NumberFormat` (pt-BR, BRL)
- [x] Contador de moedas por valor
- [x] Saque com validação — exibe "Você não tem Saldo para o saque!!" se insuficiente
- [x] Botão "Esvaziar Cofre"
- [x] Cofre SVG que enche visualmente conforme o saldo aumenta
- [x] Persistência via `localStorage`

**Explicação da lógica:**

O saldo é armazenado em centavos (inteiros) para evitar o erro de ponto flutuante do JavaScript, onde `0.1 + 0.2` resulta em `0.30000000000000004`. Guardando como inteiro e dividindo por 100 apenas na exibição, os cálculos são sempre exatos.

```js
let saldoCentavos = 0;

function adicionarMoeda(val) {
  saldoCentavos += val; // val = 10, 25, 50 ou 100
  atualizarUI();
}

new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
  .format(saldoCentavos / 100);
```

**Como alterar a moeda de R$ para US$:**

```js
// De:
new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
// Para:
new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
```

**Sugestão de versão com gráficos:**

Use o [Chart.js](https://www.chartjs.org/) para exibir um gráfico de pizza com a proporção de cada tipo de moeda no saldo. Basta incluir o CDN e passar o objeto `qtds` como dados do gráfico.

---

### ⏱️ Projeto 3 — Pomodoro

Cronômetro baseado na técnica Pomodoro com 4 sessões de 25 minutos alternadas com pausas de 5 minutos.

**Funcionalidades implementadas:**
- [x] Botões de iniciar, pausar/retomar e resetar
- [x] Timer regressivo de 25:00 atualizado a cada segundo
- [x] Troca automática entre foco e pausa ao zerar
- [x] Configuração do tempo de foco e pausa pelo usuário
- [x] Som ao terminar (Web Audio API — Dó Mi Sol Dó)
- [x] Modo noturno com botão toggle
- [x] Dots visuais de progresso nas 4 sessões
- [x] Arco SVG animado que encolhe conforme o tempo passa

**O método Pomodoro:**

A técnica foi criada por Francesco Cirillo nos anos 80. A ideia: foco total por 25 minutos, pausa de 5 minutos, repetir 4 vezes, depois pausa longa. O nome vem do timer de cozinha em formato de tomate que ele usava. Ajuda a manter concentração e evitar fadiga mental.

**Explicação do `setInterval` e `clearInterval`:**

`setInterval(fn, ms)` executa uma função repetidamente a cada intervalo. Retorna um ID usado pelo `clearInterval(id)` para cancelar.

```js
let intervalo = null;

function iniciar() {
  intervalo = setInterval(tick, 1000);
}

function pausar() {
  clearInterval(intervalo);
  intervalo = null;
}

function tick() {
  segundosRestantes--;
  atualizarDisplay();
  if (segundosRestantes <= 0) {
    clearInterval(intervalo);
    trocarFase();
  }
}
```

> ⚠️ Sempre guarde o ID retornado pelo `setInterval`. Sem ele, não é possível cancelar o intervalo — o timer continua rodando em segundo plano mesmo após pausar.

---

### 🎹 Projeto 4 — Teclado Virtual

Teclado musical interativo com 9 teclas brancas (Dó a Ré²) e 5 pretas, tocável pelo mouse ou pelo teclado físico.

**Funcionalidades implementadas:**
- [x] 9 notas brancas e 5 pretas com destaque visual ao pressionar
- [x] Som gerado via Web Audio API (sem arquivos externos)
- [x] Mapeamento do teclado físico: `A S D F G H J K L` / `W E T Y U`
- [x] Oitava adicional configurável
- [x] Gravação de sequência de notas e reprodução posterior
- [x] Exibição da nota e frequência tocada mais recentemente
- [x] Histórico das últimas notas tocadas

**Como adicionar novos sons:**

Os sons são gerados com Web Audio API, sem arquivos externos. Para adicionar uma nota, inclua sua frequência em Hz no objeto de mapeamento:

```js
const FREQS_BASE = {
  'C':  261.63, // Dó
  'D':  293.66, // Ré
  'C3': 130.81, // Dó grave (oitava abaixo) — novo
};
```

Para trocar o timbre, altere o `osc.type` em `tocarNota()`:

| Valor | Som |
|---|---|
| `'sine'` | suave, puro |
| `'triangle'` | instrumento acústico |
| `'square'` | sintetizador retrô |
| `'sawtooth'` | violino sintético |

**🔗 Testar online:** [github.com/Kauaxz89/ProjetoDK](https://github.com/Kauaxz89/ProjetoDK)

---

## Requisitos Técnicos Atendidos

* **Lógica e Estrutura**: Uso de `Math.random()` e `Math.floor()` para decisões da IA e resultados aleatórios.
* **Manipulação do DOM**: Atualização de textos, emojis e placares em tempo real via `document.querySelector` e `document.getElementById`.
* **Interface Dinâmica**: Feedback de vitória, derrota ou empate exibido instantaneamente, sem `alert()`.
* **Modularização**: Código organizado em funções independentes para cada lógica de jogo.
* **Responsividade**: Layout adaptado para computadores e dispositivos móveis.

---

## Tecnologias Utilizadas

* **HTML5**: Estruturação semântica e botões de ação.
* **CSS3**: Estilização visual moderna, fontes externas e organização de layout.
* **JavaScript (ES6)**: Lógica de jogo, eventos de clique e manipulação de objetos/arrays.

---

## Como Jogar

1. Abra o arquivo `index.html` no navegador.
2. Selecione o jogo desejado no menu principal.
3. Interaja com os botões de escolha.
4. O resultado e o placar aparecem instantaneamente na interface.
5. Use os botões de "Reiniciar" ou atualize o navegador para recomeçar.

---

## Demonstração Visual

![Screenshot da tela inicial](img/tela-inicial.png)
![Screenshot do Jokenpô](img/jokenpo.png)
![Screenshot do Cara ou Coroa](img/caraOuCoroa.png)
![Screenshot dos Dados](img/dados.png)
![Screenshot do BlackJack](img/blackJack.png)

---

## Como Executar

```bash
git clone https://github.com/Kauaxz89/ProjetoDK.git
```

Abra o arquivo `index.html` em qualquer navegador moderno.

---

## Integrantes
* Davi Kleemann
* Kauã

---

## Melhorias Futuras

- [ ] Placar persistente com `localStorage` nos jogos
- [ ] Novos jogos: Memória, Snake, Quiz
- [ ] Efeitos sonoros nos jogos de cartas e dados
