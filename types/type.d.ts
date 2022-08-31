export namespace pjtype {
  export type T_STAT = number;
  export type T_STR_BASE_OBJ = { [key: string]: any };
  export type T_DATE_OBJ = {
    year:  number,
    month: number,
    week:  number,
    day:   number,
    hour:  number,
    min:   number,
    sec:   number,
    stamp: number,
  };
}
