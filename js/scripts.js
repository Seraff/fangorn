const app = require('electron')
const { BrowserWindow } = require('electron').remote
const cp = require('child_process');
const FindInPage = require('electron-find').FindInPage
const Fangorn = require('./js/fangorn.js');
const fileDialog = require('file-dialog');

initSizes = function() {
  var bounds = app.remote.getCurrentWindow().webContents.getOwnerBrowserWindow().getBounds();
  width = $('#main-tree-container')[0].clientWidth
  $("svg#tree_display").css({ width: width-30, height: bounds.height-120});
}

$(document).ready(function() {
  document.addEventListener("fangorn_state_update", function(e){
    $('#annotate-node-action').attr('disabled','disabled');

    if (fangorn.tree_is_loaded()){
      $("[data-direction]").removeAttr('disabled');

      if (fangorn.get_selection().length > 0){
        $('.mark-button').removeAttr('disabled');

        if (fangorn.get_selection().length == 1)
          $('#annotate-node-action').removeAttr('disabled');

      } else {
        $('.mark-button').attr('disabled','disabled');
      }

      if (fangorn.fasta_is_loaded()){
        $('#save-fasta-action').removeAttr('disabled');
      } else {
        $('#save-fasta-action').attr('disabled','disabled');
      }
    } else {
      $("[data-direction]").attr('disabled','disabled');
      $('.mark-button').attr('disabled','disabled');
    }
  });

  var fangorn = Fangorn();
  fangorn.dispatch_state_update();

  var example_tree = "((first:0.150276,second:0.213019):0.230956,(third:0.263487,fourth:0.202633):0.246917);";
  fangorn.load_tree_from_text(example_tree);

  initSizes();

  const findInPage = new FindInPage(app.remote.getCurrentWebContents(), {
    parentElement: $(".window-content")[0],
    offsetTop: 65,
    duration: 150
  })

  $("#open-tree").on("click", function(){
    fileDialog({ multiple: false }, file => {
      fangorn.load_tree(file[0].path);
    });
  });

  $("#open-fasta").on("click", function(){
    fileDialog({ multiple: false }, file => {
      fangorn.load_fasta(file[0].path);
    });
  });

  $(window).on("resize", function(){
    initSizes();
  });

  $(window).on("keydown", function(e) {
    if ((e.ctrlKey || e.metaKey) && e.keyCode === 70) {
      findInPage.openFindWindow();
    }
  });

  $("#search-action").on("click", function() {
    findInPage.openFindWindow();
  });

  $("#mark-node").on("click", function() {
    fangorn.get_selection().forEach(function(n){
      n.mark();
    });

    fangorn.update_fasta_sidebar();
    fangorn.get_tree().modify_selection(function(n){ return false; });
  });

  $("#unmark-node").on("click", function() {
    fangorn.get_selection().forEach(function(n){
      n.unmark();
    });

    fangorn.update_fasta_sidebar();
    fangorn.get_tree().modify_selection(function(){});
  });

  $("#show-fasta-action").on("click", function() {
    if ($('#fasta-panel').is(":hidden")){
      $('#fasta-panel').show();
      $("#show-fasta-action").addClass("btn-pressed");
      initSizes();
    }
    else{
      $('#fasta-panel').hide();
      $("#show-fasta-action").removeClass("btn-pressed");
      initSizes();
    }
  });

  $("#save-fasta-action").on("click", function(){
    fangorn.save_fasta();
  });

  $('#annotate-node-action').on("click", function(){
    // if (!fangorn.fasta_is_loaded() || fangorn.get_selection().length != 1)
    //   return false;

    var node = fangorn.get_selection()[0];
    var title = node.fasta.title;
    $("#seq-title-input").val(title);

    $("#annotate-dialog")[0].showModal();
  });

  $("#annotation-dialog-cancel").on("click", function(){
    $("#seq-title-input").val('');
    $("#annotate-dialog")[0].close(false);
  });

  $("#annotation-dialog-save").on("click", function(){
    var node = fangorn.get_selection()[0];
    fangorn.update_node_title(node, $("#seq-title-input").val());
    $("#seq-title-input").val('');
    $("#annotate-dialog")[0].close(false);
    fangorn.get_tree().safe_update()
  });

  $("[data-direction]").on ("click", function () {
    var which_function = $(this).data ("direction") == 'vertical' ? fangorn.get_tree().spacing_x : fangorn.get_tree().spacing_y;
    which_function (which_function () + (+ $(this).data ("amount"))).safe_update();
  });

});

