/**
 * Navigation Emojis - Nitro-style navigation and UI icons
 * Premium dashboard-style icons for UI navigation
 * Replace emoji IDs with your server's custom emoji IDs
 */

export const Navigation = {
  // Directional arrows
  ArrowUp: '<a:9465_ani_arrow_up:1505200287034642545>',
  ArrowDown: '<a:5393_ani_arrow_down:1505200268021731329>',
  ArrowLeft: '<a:7905_ani_arrow_left:1505201938147311667>',
  ArrowRight: '<a:32877animatedarrowbluelite:1505233213746970795>',
  Arrows: '<:nav_arrows:1362795048476186624>',

  // Navigation 
  Home: '<:nav_home:1362795050605802496>',
  Back: '<:nav_back:1362795052735418368>',
  Forward: '<:nav_forward:1362795054865034240>',
  Return: '<:nav_return:1362795056994649600>',
  Exit: '<:nav_exit:1362795059124265472>',

  // Menu
  Menu: '<:nav_menu:1362795061253881344>',
  Hamburger: '<:nav_hamburger:1362795063383497216>',
  Dots: '<:nav_dots:1362795065513113088>',
  More: '<:nav_more:1362795067642728960>',

  // Close and minimize
  Close: '<:nav_close:1362795069772344832>',
  X: '<:nav_x:1362795071901960704>',
  Minimize: '<:nav_minimize:1362795074031576576>',
  Maximize: '<:nav_maximize:1362795076161192448>',
  Restore: '<:nav_restore:1362795078290808320>',

  // Zoom
  ZoomIn: '<:nav_zoom_in:1362795080420424192>',
  ZoomOut: '<:nav_zoom_out:1362795082550040064>',
  Fullscreen: '<:nav_fullscreen:1362795084679655936>',
  FullscreenExit: '<:nav_fullscreen_exit:1362795086809271808>',

  // Sidebar
  Sidebar: '<:nav_sidebar:1362795088938887680>',
  SidebarLeft: '<:nav_sidebar_left:1362795091068503552>',
  SidebarRight: '<:nav_sidebar_right:1362795093198119424>',

  // Window
  Window: '<:nav_window:1362795095327735296>',
  Panel: '<:nav_panel:1362795097457351168>',
  Layout: '<:nav_layout:1362795099586967040>',
  Grid: '<:nav_grid:1362795101716582912>',
  List: '<:nav_list:1362795103846198784>',

  // Tabs
  Tab: '<:nav_tab:1362795105975814656>',
  Tabs: '<:nav_tabs:1362795108105430528>',
  ChevronUp: '<:nav_chevron_up:1362795110235046400>',
  ChevronDown: '<:nav_chevron_down:1362795112364662272>',
  ChevronLeft: '<:nav_chevron_left:1362795114494278144>',
  ChevronRight: '<:nav_chevron_right:1362795116623894016>',

  // Drag and drop
  Drag: '<:nav_drag:1362795118753510880>',
  Grip: '<:nav_grip:1362795120883126272>',
  Move: '<:nav_move:1362795123012742144>',

  // Split views
  SplitVertical: '<:nav_split_vertical:1362795125142358016>',
  SplitHorizontal: '<:nav_split_horizontal:1362795127271973888>',
  Columns: '<:nav_columns:1362795129401590528>',
  Rows: '<:nav_rows:1362795131531205632>',

  // Cards and containers
  Card: '<:nav_card:1362795133660821504>',
  Cards: '<:nav_cards:1362795135790437376>',
  Frame: '<:nav_frame:1362795137920053248>',
  Box: '<:nav_box:1362795140049669120>',

  // Animated navigation indicators
  LoadingDots: '<a:nav_loading_dots:1362795142179284992>',
  Pulse: '<a:nav_pulse:1362795144308900864>',
  Wave: '<a:nav_wave:1362795146438516736>',
} as const;

export type NavigationEmoji = typeof Navigation[keyof typeof Navigation];