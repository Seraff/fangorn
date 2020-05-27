const BtnGroupRadio = require('../btn_group_radio.js')

class SearchPanel {
  constructor (panel, fangorn) {
    this.$panel = panel
    this.$search_action_button = $('#find-action')
    this.$search_mode_buttons = $('#search-mode-btn-group')
    this.$search_field = $('#search-input')
    this.$select_all_button = $('#search-select-all')
    this.$meta_info = $("#footer-meta")

    this.fangorn = fangorn
    this.search_mode_radio = new BtnGroupRadio(this.$search_mode_buttons)
    this.found_items = []

    this.$search_action_button.on('click', function () {
      search_panel.toggle()
    })

    $(window).on("keydown", (e) => {
      if (e.key == 'Escape'){
        this.hide()
      }
    })

    this.current_input_value = ''

    this.$search_field.on('keyup change', (e) => {
      if (this.current_input_value !== this.$search_field.val()) {
        this.current_input_value = this.$search_field.val()
        this.searchCurrent()
      }
    })

    document.addEventListener('new_tree_is_loaded', () => {
      if (!this.isHidden()) {
        this.searchCurrent()
      }
    })

    this.$select_all_button.on('click', () => {
      this.selectFoundItems()
    })
  }

  hide () {
    this.$panel.hide()
    this.$search_action_button.removeClass('btn-pressed')
    this.clean()
    this.refreshMetaInfo()
  }

  show () {
    this.$panel.show()
    this.$search_field.focus()
    this.$search_action_button.addClass('btn-pressed')
    this.searchCurrent()
  }

  toggle () {
    if (this.isHidden()) {
      this.show()
    } else {
      this.hide()
    }
  }

  isHidden () {
    return this.$panel.is(":hidden")
  }

  searchMode () {
    return this.search_mode_radio.active_button.data('mode')
  }

  isTreeMode () {
    return this.searchMode() == 'tree'
  }

  enableSelectAll () {
    this.$select_all_button.removeAttr('disabled')
  }

  disableSelectAll () {
    this.$select_all_button.attr('disabled', 'disabled')
  }

  searchCurrent () {
    this.search(this.current_input_value)
  }

  search (query) {
    this.clean()

    if (query.length >= SearchPanel.QUERY_MIN_LEN) {

      query = query.toLocaleLowerCase()

      if (this.isTreeMode()) {
        this.found_items = this.fangorn.get_leaves().filter((e) => {
          return e.name.toLocaleLowerCase().includes(query)
        })

        this.found_items.forEach((e) => {
          if (this.isTreeMode()) {
            e.styler.highlight()
          }
        })
      }
    }

    this.refreshSelectFoundButton()
    this.refreshMetaInfo()
  }

  clean () {
    this.found_items.forEach((e) => {
      if (this.isTreeMode()) {
        e.styler.unhighlight()
      }
    })

    this.found_items = []
  }

  isAnythingFound () {
    return this.found_items.length > 0
  }

  selectFoundItems () {
    if (!this.isAnythingFound()) {
      return false
    }

    if (this.isTreeMode()){
      this.fangorn.select_specific(this.found_items)
    }
  }

  refreshSelectFoundButton () {
    if (this.isAnythingFound()) {
      this.$select_all_button.removeAttr('disabled')
    } else {
      this.$select_all_button.attr('disabled', 'disabled')
    }
  }

  refreshMetaInfo () {
    if (this.isHidden()) {
      this.$meta_info.html('')
      return true
    }

    if (this.$search_field.val().length >= SearchPanel.QUERY_MIN_LEN) {
      this.$meta_info.html(this.found_items.length + ' matches')
    } else {
      this.$meta_info.html('')
    }
  }
}

SearchPanel.QUERY_MIN_LEN = 3

module.exports = SearchPanel
