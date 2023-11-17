title = "FROM TWO SIDES";

description = `
[Slide] Move
`;

characters = [
  `
  B
 BbB
  B
 `
 ,
  `
 rrrrr
  rrr
   r
 `,
 `
 r
 rr
 rrr
 rr
 r
 `,
 `
 yyy
 y y
 yyy
 `
];

options = {
  theme: "pixel",
  isPlayingBgm: true,
  isReplayEnabled: true,
  seed: 9,
};

/** @type {{pos:Vector, vy: number, wy: -1 | 1}[]} */
let arrows;
let nextArrowTicks;
/** @type {{x: number, vx: number}[]} */
let safes;

/** 
 * Define token object
 */
/** @type { object } */
/** @type { Vector } */
let tokens;

function update() {
  if (!ticks) {
    // Initialize variables
    arrows = [];
    nextArrowTicks = [0, 60];
    safes = [
      { x: 50, vx: -1 },
      { x: 50, vx: 1 },
    ];
    tokens = [];
  }
  

  // Create safe zones in each spike layer
  safes.forEach((s) => {
    s.x += s.vx;
    if ((s.x < 9 && s.vx < 0) || (s.x > 90 && s.vx > 0)) {
      s.vx *= -1;
    }
    s.vx += rnds(0.5);
    s.vx *= 0.98;
  });
  

  // Add spikes layers
  for (let i = 0; i < 2; i++) {
    nextArrowTicks[i]--;
    if (nextArrowTicks[i] < 0) {
      play("explosion");
      const w = rnd(10, 40) / sqrt(difficulty) + 10;
      times(15, (xi) => {
        const x = xi * 6 + 2;
        let isSafe = false;

        // Creates safe zones for the player to pass through
        safes.forEach((s) => {
          isSafe = isSafe || abs(x - s.x) < w / 2;
        });

        // Add spikes to the screen
        if (!isSafe) {
          arrows.push({
            pos: vec(x, i === 0 ? -3 : 103),
            vy: 0,
            wy: i === 0 ? 1 : -1,
          });
          addScore(1);
        }
      });
      nextArrowTicks[i] = rnd(50, 90) / sqrt(difficulty);
    }
  }

  // Create token on the screen
  if (tokens.length === 0) {
    const tokenX = rnd(0, 90);
    const tokenY = rnd(0, 90);
    tokens.push({
      pos: vec(tokenX, tokenY)
    });
  }  

  // Scaling difficulty
  const s = difficulty * 2;

  // Remove arrows if they appear offscreen
  remove(arrows, (arrow) => {
    arrow.vy += (arrow.wy * s - arrow.vy) * 0.02;
    arrow.pos.y += arrow.vy;

    // Create spikes and mirrors of them on the opposite side of the screen
    if (arrow.wy > 0) {
      char("b", arrow.pos.x, arrow.pos.y);
      char("c", arrow.pos.y, arrow.pos.x);
    } else {
      char("b", arrow.pos.x, arrow.pos.y, { mirror: { y: -1 } });
      char("c", arrow.pos.y, arrow.pos.x, { mirror: { x: -1 } });
    }
    color("red");
    color("black");
    return arrow.pos.y < -3 || arrow.pos.y > 103;
  });
  const x = clamp(input.pos.x, 1, 98);
  const y = clamp(input.pos.y, 1, 98);

  // Initialize player variable
  const player = char("a", x, y).isColliding.char;

  // Remove token if colliding with player
  remove(tokens, (t) => {
    // Initialize token object
    const token = char("d", t.pos).isColliding.char;

    // Check for collision with player
    // If collided, add to score and play sound effect
    if (token.a) {
      play("coin");
      addScore(100);
    }

    // Return value to respawn token if collected
    return (token.a);
  });

  // Check if player collided with spikes
  // End game if so
  if (player.b || player.c) {
    play("powerUp");
    end();
  }
}
