var btnBaixarExcel = document.getElementById("btnBaixarExcel");
var barraProgresso = document.getElementById("barraProgresso");
var btnBaixarPDF = document.getElementById("btnBaixarPDF");
var listaEstados = document.getElementById("listaEstados");
var listaPaginacao = document.getElementById("listaPaginacao");
var corpoTabelaMuncipio = document.getElementById("corpoTabelaMuncipio");
var overlays = document.getElementById("overlays");
var loading = document.getElementById("loading");
var resultado = document.getElementById("resultado");

const itemsPerPage = 10; // número de itens por página
var totalItems = 0; // número total de itens na lista
var totalPages = Math.ceil(totalItems / itemsPerPage); // número total de páginas
var prevButton = document.getElementById('prev-page');
var nextButton = document.getElementById('next-page');
const urlParams = new URLSearchParams(window.location.search);
const page = urlParams.get('page');
const estado = urlParams.get('estado');

var paginaCorrente = 1; // página atual

var estadoSelecionado = '';

estados = []
var listaMunicipios = []

var width = 1;
let completedRequests = 0;

var rows = []


btnBaixarExcel.disabled = true
btnBaixarPDF.disabled = true
resultado.setAttribute("class", "noShow");

window.onload = () => {
  this.getEstados()
};

function getEstados() {
  fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados`)
    .then(response => response.json())
    .then(response => {
      response.forEach(estado => {
        // id":52,"sigla":"GO","nome":"Goiás"
        const option = document.createElement('option');
        option.setAttribute('value', estado.id);
        option.setAttribute('title',estado.nome)
        option.innerHTML = estado.nome
        listaEstados.appendChild(option)
        estados.push({ id: estado.id, sigla: estado.sigla, nome: estado.nome })
      })
      resultado.setAttribute
      if (estado) {
        if (estado != null) {
          for (let i = 0; i < listaEstados.options.length; i++) {
            const option = listaEstados.options[i];
            if (option.value === estado) {
              option.selected = true;
              estadoSelecionado = option.value
              this.getMunicipioIBGE()
              break;
            }
          }
        }
      }
    })
    .catch(error => console.error(error));
}

function getEstadoSelectionado() {
  corpoTabelaMuncipio.innerHTML = "";
  paginaCorrente = 1
  estadoSelecionado = listaEstados.options[listaEstados.selectedIndex].value;
  if (estadoSelecionado != null && estadoSelecionado != "Escolhe um Estado") {
    mostrarLoading()
    corpoTabelaMuncipio
    this.getMunicipioIBGE();
  } else {
    alert("Escolhe um estado.")
  }
}

function mostrarLoading() {
  overlays.style.display = "block";
  loading.style.display = "block";
}

function esconderLoading() {
  overlays.style.display = "none";
  loading.style.display = "none";
}

function limparTabela() {
  corpoTabelaMuncipio.innerHTML = '';
}

function getMunicipioIBGE() {
  if (estadoSelecionado != null || estadoSelecionado != '') {
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoSelecionado}/distritos`)
      .then(response => response.json())
      .then(response => {
        totalItems = response.length;
        if (page != null) {
          paginaCorrente = page;
        }
        listaMunicipios = response;
        if (listaEstados.options.length > 0 && listaEstados.options != null) {
          resultado.removeAttribute("class", "noShow")
        }
        rows = []
        listaMunicipios.forEach(municipio => {
          rows.push(
            {
              "id_municipio": municipio.id, "nome": municipio.nome,
              "id_estado": municipio.municipio.microrregiao.mesorregiao.UF.id,
              "sigla": municipio.municipio.microrregiao.mesorregiao.UF.nome + " - " + municipio.municipio.microrregiao.mesorregiao.UF.sigla,
              "regiao": municipio.municipio.microrregiao.mesorregiao.UF.regiao.nome
            })
        })
        totalPages = Math.ceil(totalItems / itemsPerPage);
        renderPage(paginaCorrente);
        esconderLoading();
        paginacaoRodape();
        btnBaixarExcel.disabled = false
        btnBaixarPDF.disabled = false
      })
      .catch(error => console.error(error));
  }
}

function paginacaoRodape() {
  listaPaginacao.innerHTML = "";
  // voltar
  const itemListaPaginacaoPrevious = document.createElement('li');
  itemListaPaginacaoPrevious.setAttribute("class", "page-item");
  const filhoItemPaginacaoLinkPrevious = document.createElement('a');
  filhoItemPaginacaoLinkPrevious.setAttribute("class", "page-link");
  filhoItemPaginacaoLinkPrevious.setAttribute("onclick", "voltarPagina()");
  filhoItemPaginacaoLinkPrevious.textContent = "Voltar";
  itemListaPaginacaoPrevious.appendChild(filhoItemPaginacaoLinkPrevious);
  listaPaginacao.insertAdjacentElement('beforeend', itemListaPaginacaoPrevious);
  for (let i = 0; i < totalPages; i++) {
    // item 1
    const itemListaPaginacao = document.createElement('li');
    itemListaPaginacao.setAttribute("class", "page-item");
    const filhoItemPaginacaoLink = document.createElement('a');
    filhoItemPaginacaoLink.setAttribute("class", "page-link");
    filhoItemPaginacaoLink.setAttribute("onclick", `renderPage(${i + 1})`);
    filhoItemPaginacaoLink.textContent = i + 1;
    itemListaPaginacao.appendChild(filhoItemPaginacaoLink);
    listaPaginacao.insertAdjacentElement('beforeend', itemListaPaginacao);
  }
  // voltar
  const itemListaPaginacaoProxima = document.createElement('li');
  itemListaPaginacaoProxima.setAttribute("class", "page-item");
  const filhoItemPaginacaoLinkProxima = document.createElement('a');
  filhoItemPaginacaoLinkProxima.setAttribute("class", "page-link");
  filhoItemPaginacaoLinkProxima.setAttribute("onclick", "proximaPagina()");
  filhoItemPaginacaoLinkProxima.textContent = "Próxima";
  itemListaPaginacaoProxima.appendChild(filhoItemPaginacaoLinkProxima);
  listaPaginacao.insertAdjacentElement('beforeend', itemListaPaginacaoProxima)
}

function renderPage(pageNumber) {
  paginaCorrente = pageNumber
  // calcule o índice inicial e final dos itens na página atual
  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  limparTabela()
  // crie uma sublista com os itens na página atual
  const pageItems = listaMunicipios.slice(startIndex, endIndex);
  pageItems.forEach(function (municipio) {
    const filhoTabelaMunicipio = document.createElement('tr');
    const linhaNomeTabelaMunicipio = document.createElement('th');
    const linhaIdTabelaMunicipio = document.createElement('th');
    const linhaIdEstadoTabelaMunicipio = document.createElement('th');
    const linhaEstadoSiglaTabelaMunicipio = document.createElement('th');
    const linhaNomeRegiaoMunicipio = document.createElement('th');

    linhaNomeTabelaMunicipio.innerHTML = municipio.nome
    linhaIdTabelaMunicipio.innerHTML = municipio.id
    linhaIdEstadoTabelaMunicipio.innerHTML = municipio.municipio.microrregiao.mesorregiao.UF.id
    linhaEstadoSiglaTabelaMunicipio.innerHTML = municipio.municipio.microrregiao.mesorregiao.UF.nome + " - " + municipio.municipio.microrregiao.mesorregiao.UF.sigla;
    linhaNomeRegiaoMunicipio.innerHTML = municipio.municipio.microrregiao.mesorregiao.UF.regiao.nome;
    filhoTabelaMunicipio.insertAdjacentElement('beforeend', linhaIdTabelaMunicipio)
    filhoTabelaMunicipio.insertAdjacentElement('beforeend', linhaNomeTabelaMunicipio)
    filhoTabelaMunicipio.insertAdjacentElement('beforeend', linhaIdEstadoTabelaMunicipio)
    filhoTabelaMunicipio.insertAdjacentElement('beforeend', linhaEstadoSiglaTabelaMunicipio)
    filhoTabelaMunicipio.insertAdjacentElement('beforeend', linhaNomeRegiaoMunicipio)
    corpoTabelaMuncipio.append(filhoTabelaMunicipio)
  });
}

function voltarPagina() {
  if (paginaCorrente > 1) {
    paginaCorrente--;
    renderPage(paginaCorrente);
  }
}

function proximaPagina() {
  if (paginaCorrente < totalPages) {
    paginaCorrente++;
    renderPage(paginaCorrente);
  }
}

if (page != null) {
  // console.log(page)
  renderPage(page)
}

function getDateAgora() {
  var data = new Date();
  var dia = String(data.getDate()).padStart(2, '0');
  var mes = String(data.getMonth() + 1).padStart(2, '0');
  var ano = data.getFullYear();
  return dia + '/' + mes + '/' + ano;
}

async function baixarExcel() {
  mostrarLoading();
  try {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dates");
    XLSX.utils.sheet_add_aoa(worksheet, [["id_muninipio", "ds_municipio", "id_estado"]], { origin: "A1" });
    XLSX.writeFile(workbook, "municipio.xlsx", { compression: true });

    await new Promise(resolve => setTimeout(resolve, 3000));
  } catch (error) {
    console.log(error)
  } finally {
    esconderLoading();
  }
}

async function baixarPDF() {
  mostrarLoading();
  try {
    var baixarPdfNovo = [
      [{ text: '#ID Município', bold: true }, { text: 'Nome', bold: true },
      { text: 'ID Estado', bold: true }, { text: 'Sigla', bold: true },
      { text: 'Região', bold: true }]]
    rows.forEach(row => {
      baixarPdfNovo.push([
        { text: row.id_municipio }, { text: row.nome }, { text: row.id_estado },
        { text: row.sigla }, { text: row.regiao }])
    })
    var docDefinition = {
      content: [
        { text: getDateAgora(), fontSize: 12, alignment: 'left' },
        { text: 'Brasil', fontSize: 12, alignment: 'right', margin: [0, -12, 0, 0] },
        { text: '_______________________________________________________________________________________________' },
        { text: 'Município', fontSize: 12, alignment: 'left', margin: [0, 12, 0, 0] },
        { text: rows.length > 0 ? rows[0].sigla : "Brasil", fontSize: 12, alignment: 'right', margin: [0, -14, 0, 0] },
        { text: '_______________________________________________________________________________________________' },
        {
          margin: [0, 15, 0, 0],
          headerRows: 1,
          widths: ['*', 'auto', 100, '*'],
          table: {
            widths: ['15%', '*', '13%', '20%', '15%'],
            headerRows: 1,
            body:
              baixarPdfNovo
          }
        },
        { text: `Quantidade: ${baixarPdfNovo.length > 1 ? baixarPdfNovo.length - 1 : '0'}`, alignment: 'right', margin: [0, 10, 5, 0] },
        { text: '_______________________________________________________________________________________________' },
        { text: 'Observações: Testando o impresso', alignment: 'left', margin: [0, 10, 0, 0] },
      ],

      footer: {
        columns: [
          { text: 'Município', alignment: 'center' },
        ]
      },
    };
    var pdf = pdfMake.createPdf(docDefinition);
    pdf.download(`documento-${getDateAgora()}.pdf`);
    await new Promise(resolve => setTimeout(resolve, 3000));
  } catch (error) {
    console.error(error);
  } finally {
    esconderLoading();
  }

}