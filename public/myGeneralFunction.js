function update_input(_evt) {
  let ar = Array.from($('.sum-calc'));
  ar.forEach(e => e.value = e.value.replaceAll(/[^01]/g, ""))
}

function send_calc_button() {
  let ar = Array.from($('.sum-calc'));
  let max_len = Math.max(...ar.map(e => e.value.length))
  ar.forEach(e => e.value = e.value.padStart(max_len, "0"))
  let res = ""
  for (i = 0; i < ar[0].value.length; i++) {
    res += parseInt(ar.map(e => e.value[i]).join(""), 2)
  }
  $('#add-res')[0].innerHTML = "Result : " + res
}


function resizableGrid(table) {
  let cellsFstLine = Array.from(table.getElementsByTagName('tr')[0].getElementsByTagName("td"));
  let applyOneRow = (row) => {
    var cols = row ? row.children : undefined;
    if (!cols) return;
    // table.style.overflow = 'hidden';
    var tableHeight = table.offsetHeight;
    for (var i = 0; i < cols.length; i++) {
      var div = createDiv(tableHeight);
      cols[i].appendChild(div);
      cols[i].style.position = 'relative';
      setListeners(div);
    }

    function setListeners(div) {
      var pageX, curCol, nxtCol, curColWidth, nxtColWidth;
      div.addEventListener('mousedown', function (e) {
        curCol = e.target.parentElement;
        nxtCol = curCol.nextElementSibling;
        pageX = e.pageX;
        var padding = paddingDiff(curCol);
        curColWidth = curCol.offsetWidth - padding;
        if (nxtCol) nxtColWidth = nxtCol.offsetWidth - padding;
      });
      div.addEventListener('mouseover', function (e) {
        e.target.style.borderRight = '2px solid #0000ff';
      });
      div.addEventListener('mouseout', function (e) {
        e.target.style.borderRight = '';
      });
      document.addEventListener('mousemove', function (e) {
        if (curCol) {
          var diffX = e.pageX - pageX;
          if (nxtCol) {
            cellsFstLine[nxtCol.cellIndex].style.width = (nxtColWidth - (diffX)) + 'px';
          }
          cellsFstLine[curCol.cellIndex].style.width = (curColWidth + diffX) + 'px';
        }
      });
      document.addEventListener(
        'mouseup',
        function (_e) {
          curCol = undefined;
          nxtCol = undefined;
          pageX = undefined;
          nxtColWidth = undefined;
          curColWidth = undefined
        });
    }

    function createDiv(_height) {
      var div = document.createElement('div');
      div.style.top = 0;
      div.style.right = 0;
      div.style.width = '5px';
      div.style.position = 'absolute';
      div.style.cursor = 'col-resize';
      div.style.userSelect = 'none';
      div.style.height = "100%";
      return div;
    }

    function paddingDiff(col) {
      if (getStyleVal(col, 'box-sizing') == 'border-box')
        return 0;
      var padLeft = getStyleVal(col, 'padding-left');
      var padRight = getStyleVal(col, 'padding-right');
      return (parseInt(padLeft) + parseInt(padRight));
    }

    function getStyleVal(elm, css) {
      return (window.getComputedStyle(elm, null).getPropertyValue(css));
    }
  }
  Array.from(table.getElementsByTagName('tr')).forEach(r => applyOneRow(r));
};