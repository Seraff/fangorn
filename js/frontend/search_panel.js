const BtnGroupRadio = require('../btn_group_radio.js')

class SearchPanel {
  constructor (panel, fangorn, fasta_pane) {
    this.$panel = panel
    this.$search_action_button = $('#find-action')
    this.$search_mode_buttons = $('#search-mode-btn-group')
    this.$search_field = $('#search-input')
    this.$select_all_button = $('#search-select-all')
    this.$meta_info = $("#footer-meta")
    this.$tree_mode_button = $('#set-search-mode-to-tree')
    this.$fasta_mode_button = $('#set-search-mode-to-fasta')

    this.fangorn = fangorn
    this.fasta_pane = fasta_pane
    this.search_mode = 'tree'
    this.search_mode_radio = new BtnGroupRadio(this.$search_mode_buttons)
    this.found_items = []

    this.$search_action_button.on('click', () => {
      this.toggle()
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

    document.addEventListener('node_titles_changed', () => {
      if (!this.isHidden()) {
        this.searchCurrent()
      }
    })

    this.$select_all_button.on('click', () => {
      this.selectFoundItems()
      this.$select_all_button.blur()
    })

    this.search_mode_radio.on_change = () => {
      this.clean()
      this.search_mode = this.search_mode_radio.active_button.data('mode')
      this.searchCurrent()
    }
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

  isTreeMode () {
    return this.search_mode === 'tree'
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
      } else {
        this.found_items = this.fasta_pane.entries.filter((e) => {
          return e.id.toLocaleLowerCase().includes(query)
        })
      }

      this.found_items.forEach((e) => {
        if (this.isTreeMode()) {
          e.styler.highlight()
        } else {
          e.highlight()
        }
      })
    }

    this.refreshSelectFoundButton()
    this.refreshMetaInfo()
  }

  clean () {
    this.found_items.forEach((e) => {
      if (this.isTreeMode()) {
        e.styler.unhighlight()
      } else {
        e.unhighlight()
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
    } else {
      this.fangorn.select_specific(this.found_items.map((i) => { return i.node }))
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

SearchPanel.QUERY_MIN_LEN = 2

module.exports = SearchPanel