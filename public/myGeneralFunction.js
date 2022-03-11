function update_input(evt) {
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