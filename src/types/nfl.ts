export interface Team {
  id: string;
  name: string;
  alias: string;
  game_number: number;
  sr_id: string;
  points?: number;
}

export interface Location {
  lat: string;
  lng: string;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  address: string;
  capacity: number;
  surface: string;
  roof_type: string;
  sr_id: string;
  location: Location;
}

export interface Weather {
  condition: string;
  humidity: number;
  temp: number;
  wind: {
    speed: number;
    direction: string;
  };
}

export interface Broadcast {
  network: string;
  satellite?: string;
  internet?: string;
}

export interface Scoring {
  type: string;
  quarter: number;
  clock: string;
  points: number;
  home_points: number;
  away_points: number;
  team: {
    id: string;
    name: string;
    alias: string;
    points: number;
  };
  description?: string;
  drive?: {
    duration: string;
    play_count: number;
    yards: number;
    first_downs: number;
  };
}

export interface Game {
  id: string;
  status: 'scheduled' | 'inprogress' | 'closed' | 'complete' | 'cancelled';
  scheduled: string;
  attendance?: number;
  entry_mode?: string;
  sr_id: string;
  game_type: 'regular' | 'playoff' | 'preseason';
  conference_game: boolean;
  title?: string;
  duration?: string;
  venue: Venue;
  home: Team;
  away: Team;
  broadcast?: Broadcast;
  weather?: Weather;
  scoring?: Scoring[];
  clock?: string;
  quarter?: number;
  neutral_site?: boolean;
}

export interface Week {
  id: string;
  sequence: number;
  title: string;
  games?: Game[];
}

export interface Season {
  id: string;
  year: number;
  type: 'REG' | 'PRE' | 'PST';
  name: string;
}

export interface WeekSchedule {
  id: string;
  year: number;
  type: 'REG' | 'PRE' | 'PST';
  name: string;
  week: Week;
}

export interface SeasonSchedule {
  id: string;
  year: number;
  type: 'REG' | 'PRE' | 'PST';
  name: string;
  weeks: Week[];
}

export interface PlayerStatistics {
  id: string;
  name: string;
  jersey: string;
  position: string;
  passing?: {
    completions: number;
    attempts: number;
    yards: number;
    avg_yards: number;
    touchdowns: number;
    interceptions: number;
    rating: number;
    sacks: number;
    sack_yards: number;
  };
  rushing?: {
    attempts: number;
    yards: number;
    avg_yards: number;
    touchdowns: number;
    longest: number;
    longest_touchdown?: number;
    redzone_attempts?: number;
    fumbles?: number;
    lost_fumbles?: number;
  };
  receiving?: {
    receptions: number;
    yards: number;
    avg_yards: number;
    touchdowns: number;
    longest: number;
    longest_touchdown?: number;
    targets?: number;
    redzone_targets?: number;
    fumbles?: number;
    lost_fumbles?: number;
  };
  defense?: {
    tackles: number;
    assists: number;
    combined: number;
    sacks: number;
    sack_yards: number;
    interceptions: number;
    pass_defended: number;
    safeties?: number;
    forced_fumbles?: number;
    fumble_recoveries?: number;
  };
  kicking?: {
    extra_points: {
      attempts: number;
      made: number;
      blocked: number;
    };
    field_goals: {
      attempts: number;
      made: number;
      blocked: number;
      yards: number;
      longest: number;
    };
  };
  punting?: {
    punts: number;
    yards: number;
    gross_yards: number;
    touchbacks: number;
    inside_20: number;
    return_yards: number;
    blocked: number;
    longest: number;
  };
  kickoffs?: {
    endzone: number;
    inside_20: number;
    return_yards: number;
    touchbacks: number;
    yards: number;
    out_of_bounds: number;
    kickoffs: number;
  };
  punt_return?: {
    avg_yards: number;
    returns: number;
    yards: number;
    longest: number;
    touchdowns: number;
    longest_touchdown?: number;
    fair_catches?: number;
  };
  kick_return?: {
    avg_yards: number;
    returns: number;
    yards: number;
    longest: number;
    touchdowns: number;
    longest_touchdown?: number;
    fair_catches?: number;
  };
  fumbles?: {
    fumbles: number;
    lost_fumbles: number;
    own_rec: number;
    own_rec_yards: number;
    opp_rec: number;
    opp_rec_yards: number;
    out_of_bounds: number;
    forced_fumbles: number;
    touchdowns: number;
  };
}

export interface TeamStatistics {
  name: string;
  market: string;
  alias: string;
  id: string;
  points: number;
  touchdowns?: {
    pass: number;
    rush: number;
    total_return: number;
    total: number;
    fumble_return?: number;
    kick_return?: number;
    punt_return?: number;
    int_return?: number;
    other?: number;
  };
  rushing?: {
    attempts: number;
    yards: number;
    avg_yards: number;
    touchdowns: number;
    longest: number;
    longest_touchdown?: number;
    redzone_attempts?: number;
    fumbles?: number;
    lost_fumbles?: number;
  };
  passing?: {
    attempts: number;
    completions: number;
    yards: number;
    avg_yards: number;
    touchdowns: number;
    interceptions: number;
    first_downs: number;
    rating: number;
    sacks: number;
    sack_yards: number;
  };
  receiving?: {
    receptions: number;
    yards: number;
    touchdowns: number;
    longest: number;
    longest_touchdown?: number;
    targets?: number;
    redzone_targets?: number;
    fumbles?: number;
    lost_fumbles?: number;
  };
  fumbles?: {
    fumbles: number;
    lost_fumbles: number;
    own_rec: number;
    own_rec_yards: number;
    opp_rec: number;
    opp_rec_yards: number;
    out_of_bounds: number;
    forced_fumbles: number;
    touchdowns: number;
  };
  defense?: {
    tackles: number;
    assists: number;
    combined: number;
    sacks: number;
    sack_yards: number;
    interceptions: number;
    pass_defended: number;
    safeties?: number;
    forced_fumbles?: number;
    fumble_recoveries?: number;
  };
  field_goals?: {
    attempts: number;
    made: number;
    blocked: number;
    yards: number;
    avg_yards: number;
    longest: number;
  };
  extra_points?: {
    attempts: number;
    made: number;
    blocked: number;
  };
  penalties?: {
    penalties: number;
    yards: number;
  };
  first_downs?: {
    pass: number;
    rush: number;
    penalty: number;
    total: number;
  };
  third_down_efficiency?: {
    attempts: number;
    conversions: number;
    percentage: number;
  };
  fourth_down_efficiency?: {
    attempts: number;
    conversions: number;
    percentage: number;
  };
  red_zone_efficiency?: {
    attempts: number;
    successes: number;
    percentage: number;
  };
}

export interface CoinToss {
  home: {
    outcome: 'won' | 'lost';
    decision: 'receive' | 'defer' | 'kick';
    direction: string;
  };
  away: {
    outcome: 'won' | 'lost';
    decision: 'receive' | 'defer' | 'kick';
    direction: string;
  };
  quarter: number;
}

export interface GameBoxScore {
  id: string;
  status: string;
  scheduled: string;
  attendance?: number;
  entry_mode?: string;
  clock?: string;
  quarter?: number;
  sr_id: string;
  neutral_site?: boolean;
  game_type: string;
  conference_game: boolean;
  title?: string;
  duration?: string;
  parent_id?: string;
  weather?: Weather;
  coin_toss?: CoinToss[];
  summary?: {
    season: Season;
    week: Week;
    venue: Venue;
    home: {
      id: string;
      name: string;
      alias: string;
      market: string;
      points: number;
    };
    away: {
      id: string;
      name: string;
      alias: string;
      market: string;
      points: number;
    };
  };
  scoring?: Scoring[];
  home?: {
    id: string;
    name: string;
    alias: string;
    market: string;
    points: number;
    statistics?: TeamStatistics;
    leaders?: {
      passing?: PlayerStatistics[];
      rushing?: PlayerStatistics[];
      receiving?: PlayerStatistics[];
    };
    scoring?: Array<{ quarter: number; points: number }>;
  };
  away?: {
    id: string;
    name: string;
    alias: string;
    market: string;
    points: number;
    statistics?: TeamStatistics;
    leaders?: {
      passing?: PlayerStatistics[];
      rushing?: PlayerStatistics[];
      receiving?: PlayerStatistics[];
    };
    scoring?: Array<{ quarter: number; points: number }>;
  };
}

export interface GameStatistics {
  id: string;
  status: string;
  scheduled: string;
  attendance?: number;
  entry_mode?: string;
  clock?: string;
  quarter?: number;
  sr_id: string;
  neutral_site?: boolean;
  game_type: string;
  conference_game: boolean;
  title?: string;
  duration?: string;
  parent_id?: string;
  weather?: Weather;
  summary?: {
    season: Season;
    week: Week;
    venue: Venue;
    home: {
      id: string;
      name: string;
      alias: string;
      market: string;
      points: number;
    };
    away: {
      id: string;
      name: string;
      alias: string;
      market: string;
      points: number;
    };
  };
  home?: {
    id: string;
    name: string;
    alias: string;
    market: string;
    points: number;
    statistics: TeamStatistics;
    players?: PlayerStatistics[];
  };
  away?: {
    id: string;
    name: string;
    alias: string;
    market: string;
    points: number;
    statistics: TeamStatistics;
    players?: PlayerStatistics[];
  };
}

export interface SportradarErrorResponse {
  message: string;
  code?: number;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

