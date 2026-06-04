/**
 * Gaming Emojis - Nitro-style gaming and achievement icons
 * Premium gaming dashboard icons
 * Replace emoji IDs with your server's custom emoji IDs
 */

export const Gaming = {
  // Games
  Game: '<:gaming_game:1362795148568131584>',
  Games: '<:gaming_games:1362795150697747456>',
  Controller: '<:gaming_controller:1362795152827363328>',
  Gamepad: '<:gaming_gamepad:1362795154956979200>',

  // Achievements
  Trophy: '<:gaming_trophy:1362795157086595072>',
  TrophyGold: '<:gaming_trophy_gold:1362795159216210944>',
  TrophySilver: '<:gaming_trophy_silver:1362795161345826816>',
  TrophyBronze: '<:gaming_trophy_bronze:1362795163475442688>',
  Medal: '<:gaming_medal:1362795165605058560>',
  MedalGold: '<:gaming_medal_gold:1362795167734674432>',
  MedalSilver: '<:gaming_medal_silver:1362795169864290304>',
  MedalBronze: '<:gaming_medal_bronze:1362795171993906176>',
  Crown: '<:gaming_crown:1362795174123522048>',
  CrownGold: '<:gaming_crown_gold:1362795176253137920>',

  // Fire and streaks
  Fire: '<:gaming_fire:1362795178382753792>',
  FireEmoji: '<a:gaming_fire_emoji:1362795180512369664>',
  Flame: '<:gaming_flame:1362795182641985536>',
  Streak: '<a:gaming_streak:1362795184771601408>',
  Sparkles: '<a:gaming_sparkles:1362795186901217280>',

  // Rocket and speed
  Rocket: '<:gaming_rocket:1362795189030833152>',
  RocketLaunch: '<a:gaming_rocket_launch:1362795191160449024>',
  Lightning: '<:gaming_lightning:1362795190290060288>',
  LightningBolt: '<a:gaming_lightning_bolt:1362795195419075584>',
  Zap: '<a:gaming_zap:1362795197548691456>',
  Speed: '<:gaming_speed:1362795199678307328>',

  // Dice and cards
  Dice: '<:gaming_dice:1362795201807923200>',
  Dices: '<:gaming_dices:1362795203937539072>',
  Card: '<:gaming_card:1362795206067154944>',
  Cards: '<:gaming_cards:1362795208196770816>',

  // Target and goals
  Target: '<:gaming_target:1362795210326386688>',
  Crosshair: '<:gaming_crosshair:1362795212456002560>',
  Bullseye: '<:gaming_bullseye:1362795214585618432>',
  Goal: '<:gaming_goal:1362795216715234304>',
  Flag: '<:gaming_flag:1362795218844850176>',

  // Rank and level
  Rank: '<:gaming_rank:1362795220974466048>',
  Level: '<:gaming_level:1362795223104081920>',
  LevelUp: '<a:gaming_level_up:1362795225233697792>',
  Star: '<:gaming_star:1362795227363313664>',
  StarFilled: '<:gaming_star_filled:1362795229492929536>',
  Stars: '<a:gaming_stars:1362795231622545408>',

  // XP and points
  XP: '<:gaming_xp:1362795233752161280>',
  Points: '<:gaming_points:1362795235881777152>',
  Coin: '<:gaming_coin:1362795238011393024>',
  Coins: '<:gaming_coins:1362795240141008896>',
  Gem: '<:gaming_gem:1362795242270624768>',
  Gems: '<:gaming_gems:1362795244400240640>',

  // Inventory
  Bag: '<:gaming_bag:1362795246529856512>',
  Inventory: '<:gaming_inventory:1362795248659472384>',
  Box: '<:gaming_box:1362795250789088256>',
  Crate: '<:gaming_crate:1362795252918704128>',
  Gift: '<:gaming_gift:1362795255048320000>',

  // Swords and combat
  Sword: '<:gaming_sword:1362795257177935872>',
  Swords: '<:gaming_swords:1362795259307551744>',
  Shield: '<a:5106verifyblack:1505292863024402592>',
  Crossed: '<:gaming_crossed:1362795263566783488>',
  Dagger: '<:gaming_dagger:1362795265696399360>',
  Axe: '<:gaming_axe:1362795267826015232>',
  Bow: '<:gaming_bow:1362795269955631104>',

  // Health and stats
  Health: '<:gaming_health:1362795272085246976>',
  Heart: '<gaming_heart:1362795274214862848>',
  HeartFilled: '<:gaming_heart_filled:1362795276344478720>',
  Skull: '<:gaming_skull:1362795278474094592>',
  SkullCross: '<:gaming_skull_cross:1362795280603710464>',

  // Boss and enemies
  Boss: '<:gaming_boss:1362795282733326336>',
  Enemy: '<:gaming_enemy:1362795282862942208>',
  Monster: '<:gaming_monster:1362795286992558080>',
  Dragon: '<:gaming_dragon:1362795289122173952>',

  // Win/Lose
  Win: '<:gaming_win:1362795291251790080>',
  Lose: '<:gaming_lose:1362795293381405952>',
  Victory: '<a:gaming_victory:1362795295511021824>',
  Defeat: '<:gaming_defeat:1362795297640637696>',

  // Misc
  Skullpile: '<:gaming_skullpile:1362795299770253568>',
  Pickaxe: '<:gaming_pickaxe:1362795301899869440>',
  Hammer: '<:gaming_hammer:1362795304029485312>',
  Wrench: '<:gaming_wrench:1362795306159101184>',
  Dna: '<:gaming_dna:1362795308288717056>',
  Brain: '<:gaming_brain:1362795310418332928>',
} as const;

export type GamingEmoji = typeof Gaming[keyof typeof Gaming];