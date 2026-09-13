/** Render an original abstract score that connects breath, sound and expression. */
export function HeroArtwork() {
  return (
    <div className="hero-artwork" aria-hidden="true">
      <svg viewBox="0 0 1440 620" preserveAspectRatio="xMidYMid slice">
        <path
          className="rhythm-wash rhythm-wash-sage"
          d="M1035 84c106-46 254-18 313 83 53 92 4 207-68 268-80 67-199 89-282 31-79-55-111-181-65-271 23-45 58-86 102-111Z"
        />
        <path
          className="rhythm-wash rhythm-wash-clay"
          d="M55 442c70-55 175-53 224 9 44 55 17 137-38 173-61 40-153 29-197-28-38-49-34-119 11-154Z"
        />
        <path
          className="rhythm-line rhythm-line-primary"
          d="M-30 420C148 326 240 530 390 424s259-148 401-44 272 28 396-54 225-64 302 5"
        />
        <path
          className="rhythm-line rhythm-line-secondary"
          d="M750 165c81-81 192-88 267-26s126 75 219 14 177-51 242 5"
        />
        <g className="rhythm-bloom rhythm-bloom-one">
          <ellipse cx="1130" cy="174" rx="18" ry="43" transform="rotate(-22 1130 174)" />
          <ellipse cx="1171" cy="189" rx="18" ry="43" transform="rotate(62 1171 189)" />
          <ellipse cx="1141" cy="220" rx="18" ry="43" transform="rotate(148 1141 220)" />
          <circle cx="1146" cy="195" r="9" />
        </g>
        <g className="rhythm-bloom rhythm-bloom-two">
          <ellipse cx="242" cy="164" rx="12" ry="30" transform="rotate(-35 242 164)" />
          <ellipse cx="271" cy="173" rx="12" ry="30" transform="rotate(55 271 173)" />
          <ellipse cx="252" cy="199" rx="12" ry="30" transform="rotate(145 252 199)" />
          <circle cx="255" cy="179" r="7" />
        </g>
        <g className="rhythm-note rhythm-note-one">
          <path d="M1265 350v63c0 17-15 29-34 25-13-3-21-14-17-25 4-12 19-19 36-15V345l65-17v55c0 17-15 29-34 25-13-3-21-14-17-25 4-12 19-19 36-15v-57Z" />
        </g>
        <g className="rhythm-note rhythm-note-two">
          <path d="M342 245v45c0 12-11 21-24 18-10-2-15-10-12-18 3-9 14-14 26-11v-41l46-12v40c0 12-11 21-24 18-10-2-15-10-12-18 3-9 14-14 26-11v-42Z" />
        </g>
        <circle className="rhythm-dot rhythm-dot-one" cx="1000" cy="310" r="7" />
        <circle className="rhythm-dot rhythm-dot-two" cx="407" cy="166" r="5" />
        <circle className="rhythm-dot rhythm-dot-three" cx="1350" cy="258" r="4" />
      </svg>
    </div>
  );
}
