function templateSelect(element) {
  document.querySelectorAll(".dropdown-item").forEach(e => { e.classList.remove("selected"); });
  element.classList.add("selected");
  document.querySelector("#template-select").innerHTML = element.innerText + ' <i class="fa fa-caret-down"></i>';
}

$(function(){
  $('#hiddenSourceFilePath').text($('#sourceFilePath').val());
  $('#sourceFilePath').width($('#hiddenSourceFilePath').width());
}).on('input', function () {
  $('#hiddenSourceFilePath').text($('#sourceFilePath').val());
  $('#sourceFilePath').width($('#hiddenSourceFilePath').width()+12);
  const remaining = document.querySelector(".topnav").offsetWidth-document.querySelector("#template-select").offsetWidth-330;
  $('#sourceFilePath').css('maxWidth',remaining);
});

let loadbutton=document.getElementById("load-problem");
let savebutton=document.getElementById("save-problem");
let renderbutton=document.getElementById("render-button");
let problemiframe = document.getElementById("rendered-problem");

problemiframe.addEventListener('load', () => { insertListener(); activeButton(); console.log("loaded..."); } )

savebutton.addEventListener("click", event => {
  const writeurl = '/render-api/can'

  let formData = new FormData()
  formData.set("problemSource", window.btoa(cm.getValue()))
  formData.set("writeFilePath", document.getElementById('sourceFilePath').value)
  const write_params = {
    body : formData,
    method : "post"
  }

  fetch(writeurl, write_params).then(function(response) {
    if (response.ok) {
      return response.text();
    } else {
      return response.json();
    }
  }).then(function(data) {
    if (data.message) {
      throw new Error("Could not write to file: " + data.message);
    } else {
      alert("Successfully written to file: " + data);
    }
  }).catch(function(e) {
    alert(e.message);
  });
})

loadbutton.addEventListener("click", event => {
  event.preventDefault();
  const sourceurl = '/render-api/tap'

  let formData = new FormData();
  formData.set("sourceFilePath", document.getElementById('sourceFilePath').value);
  const source_params = {
    body : formData,
    method : "post"
  };

  fetch(sourceurl, source_params).then(function(response) {
    if (response.ok) {
      return response.text();
    } else {
      throw new Error("Could not reach the API: " + response.statusText);
    }
  }).then(function(data) {
    cm.setValue(data);
    document.getElementById("currentEditPath").innerText = document.getElementById('sourceFilePath').value;
  }).catch(function(error) {
    cm.setValue(error.message);
    console.log(error.message);
  });
});

renderbutton.addEventListener("click", event => {
  event.preventDefault();
  document.getElementById("rendered-problem").srcdoc = "Loading..."
  const renderurl = '/render-api'

  let formData = new FormData();
  formData.set("sourceFilePath", document.getElementById('sourceFilePath').value);
  formData.set("problemSeed", document.getElementById('problemSeed').value);
  formData.set("outputformat", document.querySelector(".dropdown-item.selected").id);
  formData.set("problemSource", window.btoa(cm.getValue()));
  [...document.querySelectorAll('.checkbox-input:checked')].map(e => e.name).forEach( (box) => {
    formData.append(box, 1);
  });
  formData.append("format", "json");
  const render_params = {
    body : formData,
    method : "post"
  };

  fetch(renderurl, render_params).then(function(response) {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error("Could not reach the API: " + response.statusText);
    }
  }).then(function(data) {
    console.log("render data: ", data)
    problemiframe.srcdoc = data.renderedHTML;
  }).catch(function(error) {
    document.getElementById("rendered-problem").innerHTML = error.message;
  });
  return true;
});

function activeButton() {
  let problemForm = problemiframe.contentWindow.document.getElementById('problemMainForm')
  if (!problemForm) {console.log("could not find form!"); return;}
  problemForm.querySelectorAll('.btn-primary').forEach( button => {
    button.addEventListener('click', () => {
      button.classList.add("btn-clicked");
      console.log("clicked: ", button);
    })
  })
}

function insertListener() {
  // assuming global problemiframe - too sloppy?
  let problemForm = problemiframe.contentWindow.document.getElementById('problemMainForm')
  // don't croak when the empty iframe is first loaded
  // problably not an issue for rederly/frontend
  if (!problemForm) {console.log("could not find form!"); return;}
  problemForm.addEventListener("submit", event => {
    event.preventDefault()
    let formData = new FormData(problemForm)
    let clickedButton = problemForm.querySelector('.btn-clicked')
    formData.set("format", "json");
    formData.set("outputformat", document.querySelector(".dropdown-item.selected").id);
    formData.set(clickedButton.name, clickedButton.value);
    formData.set("problemSource", window.btoa(cm.getValue()));
    const submiturl = '/render-api'
    const submit_params = {
      body : formData,
      method : "post"
    }

    fetch(submiturl, submit_params).then( function(response) {
      if (response.ok) {
        return response.json()
      } else {
        throw new Error("Could not submit your answers: " + response.statusText)
      }
    }).then( function(data) {
      console.log(data);
      problemiframe.srcdoc = data.renderedHTML
    }).catch( function(error) {
      document.getElementById("rendered-problem").innerHTML = error.message
    })
  })
}
