(() => {
  window.rInt = (from, to) => Math.floor(from + Math.random() * (to - from));
  window.rFloat = (from, to) => from + Math.random() * (to - from);

  window.gc = {
    res: { x: 1280, y: 720 },
    start: +new Date(),
    last: +new Date(),
    paused: false,
    splashScreen: true,
    graphicsQuality: 1,
    changeQuality: (value) => {
      gc.graphicsQuality = value;
      changeCanvasSize();
    },
  };

  function initOutput(element) {
    gc.canvas = element;

    window.c = gc.canvas.getContext("2d");
    c.imageSmoothingEnabled = false;
    window.l = c.lineTo.bind(c);
    window.m = c.moveTo.bind(c);
    window.bp = c.beginPath.bind(c);
    window.cp = c.closePath.bind(c);
  }

  function init() {
    initOutput(document.getElementById("app"));
    gc.gravity = new V(0, -0.8);

    resize();

    control.i();

    scene.i();

    live();

    gc.canvas.addEventListener("click", (e) => {
      if (gc.splashScreen) gc.splashScreen = false;
      gc.ac = window.AudioContext
        ? new AudioContext()
        : new window.webkitAudioContext();
    });
  }

  function resize() {
    gc.size = { x: window.innerWidth, y: window.innerHeight };
    gc.originalRatio = Math.min(gc.size.x / gc.res.x, gc.size.y / gc.res.y);
    gc.canvas.style.width = Math.round(gc.res.x * gc.originalRatio) + "px";
    gc.canvas.style.height = Math.round(gc.res.y * gc.originalRatio) + "px";
    gc.ratio = gc.originalRatio * (window.devicePixelRatio || 1);

    changeCanvasSize();
  }

  function changeCanvasSize() {
    gc.canvas.width = Math.round(gc.res.x * gc.ratio * gc.graphicsQuality);
    gc.canvas.height = Math.round(gc.res.y * gc.ratio * gc.graphicsQuality);
  }

  function live() {
    gc.last = +new Date();

    n();
    r();
    requestAnimationFrame(live);
  }

  function reset() {
    scene.reset();

    gc.paused = false;
  }

  function nextLevel(direction) {
    setTimeout(() => {
      map.nextLevel(direction);
      reset();
    }, 30);
  }

  function n() {
    if (gc.paused) return;
    scene.n();

    if (character.isGoingBack()) {
      gc.paused = true;
      nextLevel(-1);
    } else if (character.levelIsCompleted()) {
      gc.paused = true;
      nextLevel(1);
    } else if (character.isDead()) {
      gc.paused = true;
      reset();
    }
  }

  function r() {
    c.save();
    c.scale(gc.ratio * gc.graphicsQuality, gc.ratio * gc.graphicsQuality);
    scene.r();
    c.restore();
  }

  window.onload = init;
  window.onresize = resize;
})();

window.control = (() => {
  const pressed = [0, 0, 0];

  return {
    i: () => {
      window.addEventListener("keydown", (event) => {
        if (event.code === "KeyA" || event.code === "ArrowLeft") {
          pressed[0] = 1;
        }
        if (
          event.code === "KeyW" ||
          event.code === "Space" ||
          event.key === "ArrowUp"
        ) {
          pressed[1] = 1;
        }
        if (event.code === "KeyD" || event.code === "ArrowRight") {
          pressed[2] = 1;
        }

        if (event.code === "Digit1") {
          gc.changeQuality(1);
        }
        if (event.code === "Digit2") {
          gc.changeQuality(0.75);
        }
        if (event.code === "Digit3") {
          gc.changeQuality(0.5);
        }
        if (event.code === "Digit4") {
          gc.changeQuality(0.1);
        }
      });
      window.addEventListener("keyup", (event) => {
        if (event.code === "KeyA" || event.code === "ArrowLeft") {
          pressed[0] = 0;
        }
        if (
          event.code === "KeyW" ||
          event.code === "Space" ||
          event.code === "ArrowUp"
        ) {
          pressed[1] = 0;
        }
        if (event.code === "KeyD" || event.code === "ArrowRight") {
          pressed[2] = 0;
        }
      });
    },
    pressed: pressed,
  };
})();

window.characterAnimations = (() => {
  const size = [36, 59];
  const gMain = [
    [[0, 9, 36, 0, 21, 26], "", "black", 1],
    [[21, 27, 34, 39, 34, 59], "", "black", 1],
    [[21, 27, 21, 45, 8, 58], "", "black", 1],
    [[22, 7, 29, 6, 26, 11], "", "red", 1],
  ];
  const gList = {
    stay: [
      gMain,
      [
        [
          [1, 12, 37, 3, 22, 29],
          [22, 29, 35, 41, 34, 59],
          [22, 29, 21, 47, 8, 58],
          [23, 10, 30, 9, 27, 14],
        ],
      ],
      400,
      false,
    ],
    walk: [
      gMain,
      [
        [
          [3, 8, 41, 5, 21, 28],
          [21, 27, 24, 44, 13, 60],
          [22, 26, 28, 44, 21, 58],
          [24, 9, 31, 10, 27, 14],
        ],
        [
          [0, 9, 36, 0, 21, 26],
          [21, 27, 17, 44, 1, 55],
          [22, 26, 34, 40, 32, 58],
          [22, 7, 29, 6, 26, 11],
        ],
        [
          [2, 8, 39, 3, 21, 28],
          [21, 26, 30, 41, 25, 60],
          [21, 27, 25, 45, 14, 60],
          [23, 8, 31, 9, 26, 13],
        ],
      ],
      110,
    ],
    slowWalk: [
      gMain,
      [
        [
          [3, 8, 41, 5, 21, 28],
          [21, 27, 24, 44, 13, 60],
          [22, 26, 28, 44, 21, 58],
          [24, 9, 31, 10, 27, 14],
        ],
        [
          [0, 9, 36, 0, 21, 26],
          [21, 27, 17, 44, 1, 55],
          [22, 26, 34, 40, 32, 58],
          [22, 7, 29, 6, 26, 11],
        ],
        [
          [2, 8, 39, 3, 21, 28],
          [21, 26, 30, 41, 25, 60],
          [21, 27, 25, 45, 14, 60],
          [23, 8, 31, 9, 26, 13],
        ],
      ],
      320,
    ],
    jump: [
      gMain,
      [
        [
          [1, 5, 36, -7, 24, 20],
          [24, 20, 26, 39, 17, 59],
          [24, 21, 20, 41, 8, 58],
          [24, 1, 30, -2, 28, 4],
        ],
        [
          [2, 4, 39, -5, 23, 21],
          [23, 21, 27, 36, 17, 52],
          [23, 21, 23, 40, 11, 53],
          [25, 2, 32, 0, 29, 6],
        ],
      ],
      150,
      true,
    ],
    drop: [
      gMain,
      [
        [
          [1, 21, 38, 22, 17, 44],
          [17, 43, 38, 46, 26, 58],
          [16, 42, 22, 56, 8, 58],
          [21, 25, 28, 26, 24, 30],
        ],
        [0, 0, 0, 0],
      ],
      120,
      true,
    ],
    sit: [
      gMain,
      [
        [
          [1, 21, 38, 22, 17, 44],
          [17, 43, 38, 46, 26, 58],
          [16, 42, 22, 56, 8, 58],
          [21, 25, 28, 26, 24, 30],
        ],
      ],
      400,
      true,
    ],
    wall: [
      [
        [[0, 2, 34, 0, 20, 21], "", "black", 1],
        [[20, 20, 40, 30, 34, 14], "", "black", 1],
        [[19, 20, 32, 33, 38, 53], "", "black", 1],
        [[12, 9, 7, 4, 14, 4], "", "red", 1],
      ],
      [],
    ],
    fall: [
      [
        [[3, 0, 39, 10, 13, 26], "", "black", 1],
        [[13, 25, 26, 38, 26, 57], "", "black", 1],
        [[13, 25, 13, 44, 0, 57], "", "black", 1],
        [[23, 8, 30, 10, 25, 13], "", "red", 1],
      ],
      [[0, [13, 25, 29, 33, 28, 52], [13, 25, 8, 43, -7, 51], 0]],
      150,
    ],
    die: [
      gMain,
      [
        [
          [3, 56, 27, 27, 31, 58],
          [66, 46, 57, 60, 34, 59],
          [-29, 57, -8, 49, 7, 59],
          [21, 40, 25, 34, 26, 41],
        ],
      ],
      1000,
      true,
    ],
    flying: [
      [
        [[38, 0, 63, 28, 32, 27], "", "black", 1],
        [[32, 26, 21, 40, 2, 42], "", "black", 1],
        [[32, 26, 13, 27, 0, 14], "", "black", 1],
        [[51, 19, 56, 24, 50, 24], "", "red", 1],
      ],
      [
        [
          [33, 0, 62, 23, 32, 27],
          [32, 27, 18, 37, -2, 28],
          [32, 26, 14, 23, 7, 9],
          [48, 17, 55, 19, 49, 22],
        ],
      ],
      500,
    ],
    dancing: [
      gMain,
      [
        [
          [20, -2, 49, 22, 18, 25],
          [19, 25, 35, 32, 22, 43],
          [19, 25, 16, 44, 1, 58],
          [36, 15, 42, 19, 36, 20],
        ],
        [
          [4, 10, 38, -6, 28, 23],
          [27, 23, 24, 40, 7, 56],
          [26, 23, 30, 41, 24, 56],
          [27, 2, 33, -1, 31, 5],
        ],
        [
          [17, -4, 50, 14, 21, 23],
          [21, 23, 21, 41, 8, 56],
          [21, 24, 38, 31, 25, 40],
          [35, 9, 41, 13, 35, 14],
        ],
      ],
      250,
    ],
  };

  let current = new Anim(...gList.stay, 300);
  let currentName = "stay";
  let mirrored = false;
  let nextAnim;
  let isBlocked = false;

  function next() {
    if (!nextAnim) return;
    current = new Anim(...gList[nextAnim]);
    currentName = nextAnim;
    nextAnim = null;
    isBlocked = false;
  }

  return {
    mirror: (value) => {
      mirrored = value;
    },
    to: (name, blocked, force) => {
      if (name === "walk") {
        sfx.run();
      } else if (name === "wall") {
        sfx.wall();
      } else if (name === "flying") {
        sfx.flying();
      }
      if (currentName === name) return;
      if (name === "jump") {
        sfx.jump();
      } else if (name === "drop") {
        sfx.fall();
      } else if (name === "die") {
        sfx.die();
      }
      if (isBlocked && !force) {
        nextAnim = name;
      } else {
        current = new Anim(...gList[name]);
        currentName = name;
        isBlocked = blocked;
      }
    },
    r: (position, scale) => {
      let s = scale || 1;
      c.translate(position.x + size[0] / 2, position.y + size[1] / 2);
      c.scale(mirrored ? -s : s, -s);
      draw.r(current.n(), size);
      if (isBlocked && current.isFinished()) {
        next();
      }
    },
  };
})();

window.character = (() => {
  const MASS = 0.9;
  const MAX_SPEED = 4;
  const MAX_STAMINA = 15;
  const OUT_STAMINA_AT_WALL_JUMP = 2.5;
  const OUT_STAMINA_AT_WALL = 0.07;

  let atFinalPosition = false;
  let finalOpacity = 1;
  let die = {
    isDead: false,
    dying: false,
  };
  let levelIsCompleted = false;
  let isGoingBack = false;
  let velocity = new V();
  let position;
  const size = { x: 36, y: 59 };
  let jump = {
    first: true,
    second: false,
    done: false,
  };
  let inAir = false;
  let lastMove = +new Date();
  let isRelaxing = false;

  let stamina = MAX_STAMINA;

  function collision(position) {
    const collisionInfo = {
      touches: [],
      sides: [],
      isOverFan: false,
    };

    map.getMap().enemy.forEach((block) => {
      if (block.type === 8) {
        if (
          position.x + size.x / 2 > block.x &&
          position.x + size.x / 2 < block.x + 120 &&
          position.y >= block.y - 10
        ) {
          const distance = position.y - block.y;
          if (distance < 400) {
            velocity.add(new V(0, 3 * (1 - distance / 400)));
            characterAnimations.to("flying");
          }
          collisionInfo.isOverFan = true;
        }
      } else if (block.type === 3) {
        if (
          block.active &&
          block
            .center()
            .distance(position.get().add(new V(size.x / 2, size.y / 2))) <
            block.collisionRadius + 20
        ) {
          jump.done = false;
          stamina = MAX_STAMINA;
          block.destroy();
        }
      } else {
        if (
          block
            .center()
            .distance(position.get().add(new V(size.x / 2, size.y / 2))) <
          block.collisionRadius + 20
        ) {
          toDie();
        }
      }
    });

    map.getMap().map.forEach((block) => {
      if (
        block.active &&
        position.x + size.x > block.x &&
        position.x < block.x + block.w &&
        position.y < block.y + block.h &&
        position.y + size.y > block.y
      ) {
        const coords = [
          block.y + block.h,
          block.x + block.w,
          block.y - size.y,
          block.x - size.x,
        ];
        const distances = [
          block.y + block.h - position.y,
          block.x + block.w - position.x,
          position.y + size.y - block.y,
          position.x + size.x - block.x,
        ];

        const side = distances.indexOf(Math.min(...distances));

        collisionInfo.sides.push(side);
        collisionInfo.touches.push({
          side: side,
          type: block.type,
          intersect: coords[side],
          velocity: block.getVelocity(),
        });

        if (block.type === 4) {
          block.startFalling();
        }
      }
    });

    return collisionInfo;
  }

  function toDie(falling) {
    if (die.dying) return;
    if (falling) {
      particles.dying(position.get().add(new V(0, size.y)), [
        color.dying1,
        color.dying2,
        color.dying3,
        color.dying4,
      ]);
    } else {
      particles.dying(position, [
        color.dying1,
        color.dying2,
        color.dying3,
        color.dying4,
      ]);
    }
    velocity = new V();
    die.dying = true;
    setTimeout(() => {
      toDead();
    }, 1000);
  }

  function toDead() {
    die.isDead = true;
  }

  return {
    i: () => {
      position = map.getStart().get();
    },
    reset: () => {
      velocity = new V();
      position = map.getCharacterStart().get();
      stamina = MAX_STAMINA;
      characterAnimations.mirror(position.x !== 0);
      die = {
        dying: false,
        isDead: false,
      };
      characterAnimations.to("stay");
      inAir = false;
      levelIsCompleted = false;
      isGoingBack = false;
    },
    n: () => {
      if (die.dying) {
        characterAnimations.to("die", false, true);
        const acc = velocity.get().normalize().mult(-0.017);
        acc.add(gc.gravity.get().mult(MASS / 2));
        velocity.add(acc);
        position.add(velocity);
        return false;
      }

      const acc = velocity.get().normalize().mult(-0.017);
      acc.add(gc.gravity.get().mult(MASS));

      if (control.pressed[0]) {
        acc.add(new V(-1, 0));
        characterAnimations.mirror(true);
      } else if (control.pressed[2]) {
        acc.add(new V(1, 0));
        characterAnimations.mirror(false);
      }

      velocity.add(acc);
      velocity.x =
        Math.abs(velocity.x) < MAX_SPEED
          ? velocity.x
          : (Math.abs(velocity.x) / velocity.x) * MAX_SPEED;
      position.add(velocity);

      const collisionResult = collision(position);

      collisionResult.touches.forEach((item) => {
        if (item.type === 1) {
          if (velocity.y > 0) {
            velocity.y = 0;
          }
          toDie();
          return;
        }

        if (item.side === 0 && velocity.y <= 0) {
          stamina += 0.3;
          if (stamina > MAX_STAMINA) stamina = MAX_STAMINA;
          position.y = item.intersect;
          velocity.y = 0;
          position.add(item.velocity);

          if (!control.pressed[0] && !control.pressed[2]) {
            if (item.type === 2) {
              velocity.x /= 1.02;
            } else {
              velocity.x /= 2;
            }
          }
          if (Math.abs(velocity.x) > 0.1) {
            particles.addRunning(position, velocity);
          }
        }

        if (item.side === 1) {
          position.x = item.intersect;
          if (
            control.pressed[0] &&
            velocity.y < 0 &&
            stamina > 0 &&
            collisionResult.sides.indexOf(0) === -1
          ) {
            velocity = item.velocity;
            characterAnimations.to("wall");
            particles.addWall(position, -1);
            stamina -= OUT_STAMINA_AT_WALL;

            if (control.pressed[1]) {
              if (jump.first) {
                velocity.add(new V(20, 15));
                characterAnimations.to("jump", false, true);
                jump.first = false;
                stamina -= OUT_STAMINA_AT_WALL_JUMP;
              }
            } else {
              jump.first = true;
            }
          }
        }

        if (item.side === 3) {
          position.x = item.intersect;
          if (
            control.pressed[2] &&
            velocity.y < 0 &&
            stamina > 0 &&
            collisionResult.sides.indexOf(0) === -1
          ) {
            velocity = item.velocity;
            characterAnimations.to("wall");
            particles.addWall(position, 1);
            stamina -= OUT_STAMINA_AT_WALL;

            if (control.pressed[1]) {
              if (jump.first) {
                velocity.add(new V(-20, 15));
                characterAnimations.to("jump", false, true);
                jump.first = false;
                stamina -= OUT_STAMINA_AT_WALL_JUMP;
              }
            } else {
              jump.first = true;
            }
          }
        }
        if (item.side === 2) {
          position.y = item.intersect;
          velocity.y = velocity.y >= 0 ? 0 : velocity.y;
        }
      });

      if (collisionResult.sides.indexOf(0) !== -1 && velocity.y <= 0) {
        if (control.pressed[0] || control.pressed[2]) {
          characterAnimations.to("walk");
        } else if (!isRelaxing) {
          characterAnimations.to("stay");
        }

        if (control.pressed[1]) {
          if (jump.first) {
            velocity.add(new V(0, 15));
            characterAnimations.to("jump", false, true);
            jump.first = false;
          }
        }

        if (!jump.first && !control.pressed[1]) {
          jump.first = true;
          jump.second = false;
          jump.done = false;
        }

        if (inAir) {
          characterAnimations.to("drop", true);
          particles.addJump(position, velocity.x);
          inAir = false;
        }
      } else {
        inAir = true;
      }

      if ((!collisionResult.sides.length || stamina < 0) && velocity.y < 0) {
        if (!collisionResult.isOverFan) {
          characterAnimations.to("fall");
        }

        if (control.pressed[1] && (jump.second || jump.first)) {
          velocity.apply(new V(0, 15));
          characterAnimations.to("jump", false, true);
          jump.first = false;
          jump.second = false;
          jump.done = true;
        }

        if (!control.pressed[1] && !jump.first && !jump.done) {
          jump.second = true;
        }
      }

      if (!control.pressed[1] && velocity.y > 0) {
        velocity.y /= 1.2;
      }

      if (position.x < 0 && map.isFirst()) {
        position.x = 0;
      } else if (position.x + size.x <= 0) {
        isGoingBack = true;
      }

      if (position.y + size.y < 0) toDie(true);

      if (position.x >= map.getEnd().x + 40) {
        levelIsCompleted = true;
      }

      if (control.pressed[0] || control.pressed[1] || control.pressed[2]) {
        lastMove = +new Date();
      }

      if (+new Date() - lastMove > 20000) {
        if (!isRelaxing) {
          isRelaxing = true;
          characterAnimations.to(["dancing", "sit"][rInt(0, 2)]);
        }
      } else {
        isRelaxing = false;
      }
    },
    nFinal: () => {
      const maxSpeed = 1;
      if (!atFinalPosition) {
        characterAnimations.to("slowWalk");

        const acc = velocity.get().normalize().mult(-0.017);
        acc.add(new V(0.1, 0));

        velocity.add(acc);
        velocity.x =
          Math.abs(velocity.x) < maxSpeed
            ? velocity.x
            : (Math.abs(velocity.x) / velocity.x) * maxSpeed;
        position.add(velocity);

        if (position.x >= 1000 - size.x / 2) {
          position.x = 1000 - size.x / 2;
          atFinalPosition = true;
          characterAnimations.to("dancing");
          setTimeout(() => {
            finalScene.i();
          }, 5000);
        }
      } else {
        finalOpacity -= 0.004;
        if (finalOpacity < 0) {
          finalOpacity = 0;
        }
      }
    },
    nSplashScreen: () => {},
    r: () => {
      c.save();
      characterAnimations.r(position);
      c.restore();

      if (stamina < MAX_STAMINA) {
        c.save();
        c.fillStyle = color.stamina;
        c.fillRect(
          position.x - 10,
          position.y + size.y + 10,
          stamina * 4 < 0 ? 0 : stamina * 6,
          8,
        );
        c.restore();
      }
    },
    rFinal: () => {
      c.save();
      c.globalAlpha = finalOpacity;
      c.scale(1, 1 + (1 - finalOpacity));
      characterAnimations.r(position);
      c.globalAlpha = 1;
      c.restore();
    },
    rSplashScreen: () => {
      c.save();
      characterAnimations.r(new V(320, 350), 6);
      c.restore();
    },
    position: () => position,
    isDead: () => die.isDead,
    levelIsCompleted: () => levelIsCompleted,
    isGoingBack: () => isGoingBack,
  };
})();

window.background = (() => {
  const g1 = [
    [
      [
        0, 2, 494, 0, 497, 163, 469, 51, 471, 144, 451, 96, 447, 162, 423, 65,
        425, 139, 385, 52, 373, 146, 352, 157, 350, 37, 330, 130, 310, 159, 290,
        151, 281, 38, 273, 163, 262, 88, 255, 141, 232, 39, 215, 141, 203, 162,
        180, 94, 174, 163, 152, 157, 143, 89, 117, 124, 113, 172, 77, 149, 74,
        85, 57, 164, 54, 82, 32, 173, 19, 60, 2, 160,
      ],
      "",
      "black",
      1,
    ],
    [[138, 107, 124, 167, 156, 194], "", "black", 1],
    [[183, 116, 189, 156, 182, 195, 179, 154], "", "black", 1],
    [[233, 63, 214, 158, 232, 159], "", "black", 1],
    [[236, 75, 251, 151, 237, 195], "", "black", 1],
    [[281, 94, 279, 158, 288, 162], "", "black", 1],
    [[346, 76, 347, 149, 353, 182, 321, 199, 322, 167], "", "black", 1],
    [
      [387, 75, 374, 149, 386, 149, 401, 181, 401, 147, 426, 150, 393, 106],
      "",
      "black",
      1,
    ],
    [[455, 117, 455, 154, 475, 158], "", "black", 1],
    [[18, 88, 2, 204, 23, 162], "", "black", 1],
    [[50, 115, 41, 163, 55, 193], "", "black", 1],
  ];

  return {
    i: () => {},
    reset: () => {},
    n: () => {},
    r: () => {
      c.save();
      c.translate(
        2400 - camera.getPosition().x / 2,
        1000 - camera.getPosition().y / 2,
      );
      c.globalAlpha = 0.1;
      c.scale(10, -10);
      draw.r(g1, [497, 204]);
      c.globalAlpha = 1;
      c.restore();
    },
  };
})();

function PowerBlock(type, x, y) {
  this.type = type;
  this.x = x;
  this.y = y;
  this.active = true;
  this.collisionRadius = 35;

  let startBeingInactive = 0;
  let opacity = 1;

  const anim = new Anim(
    [[[18, 0, 18, 37, 0, 17], "", "power", 1]],
    [[[18, 4, 18, 42, 36, 21]]],
    500,
  );

  this.center = () => new V(this.x + 15, this.y + 15);

  this.destroy = () => {
    this.active = false;
    opacity = 0;
    startBeingInactive = +new Date();
    particles.takePower(new V(this.x, this.y));
    sfx.takePower();
  };

  this.n = () => {
    if (!this.active && +new Date() - startBeingInactive >= 4000) {
      this.active = true;
    }

    if (this.active) {
      opacity += 0.03;
      if (opacity > 1) {
        opacity = 1;
      }
    }
  };

  this.r = () => {
    if (this.active) {
      c.save();
      c.globalAlpha = opacity;
      c.translate(this.x, this.y);
      c.scale(1, -1);
      draw.r(anim.n(), [36, 37]);
      c.globalAlpha = 1;
      c.restore();
    }
  };
}

function FanBlock(type, x, y) {
  this.type = type;
  this.x = x;
  this.y = y;
  this.active = true;
  let fanLast = +new Date();

  const anim = new Anim(
    [
      [[1, 56, 118, 55, 109, 44, 9, 45], "black", "black", 1],
      [[0, 50, 0, 81, 120, 81, 120, 50], "black", "black", 1],
      [[8, 60, 7, 66, 11, 69, 15, 68, 15, 62], "", "mechanics", 1],
      [[103, 59, 108, 62, 107, 68, 100, 69, 99, 62], "", "mechanics", 1],
      [
        [
          18, 45, 14, 34, 14, 27, 12, 18, 15, 11, 18, 1, 19, 1, 17, 11, 14, 17,
          17, 26, 18, 34, 20, 44,
        ],
        "black",
        "black",
        1,
      ],
      [
        [
          30, 46, 27, 37, 29, 30, 25, 15, 29, 6, 29, 0, 32, 0, 31, 6, 27, 15,
          31, 29, 30, 37, 33, 45,
        ],
        "black",
        "black",
        1,
      ],
      [
        [
          62, 45, 64, 44, 63, 30, 61, 21, 64, 12, 65, 1, 62, 1, 60, 11, 58, 21,
          61, 30,
        ],
        "black",
        "black",
        1,
      ],
      [
        [
          90, 45, 92, 45, 91, 37, 92, 26, 95, 17, 94, 8, 94, 2, 91, 2, 92, 9,
          92, 16, 88, 25, 88, 37,
        ],
        "black",
        "black",
        1,
      ],
    ],
    [
      [
        0,
        0,
        0,
        0,
        [
          18, 45, 23, 34, 24, 26, 23, 20, 13, 19, 10, 13, 13, 8, 16, 16, 26, 17,
          27, 26, 25, 35, 20, 44,
        ],
        [
          30, 46, 37, 37, 39, 30, 41, 16, 44, 9, 36, 1, 41, 1, 47, 8, 44, 17,
          42, 29, 41, 37, 33, 45,
        ],
        [
          62, 45, 64, 44, 58, 30, 67, 26, 73, 21, 63, 10, 62, 17, 69, 20, 64,
          24, 56, 31,
        ],
        [
          90, 45, 92, 45, 95, 37, 101, 24, 99, 16, 92, 10, 85, 5, 82, 6, 88, 13,
          96, 17, 99, 25, 92, 37,
        ],
      ],
      [
        0,
        0,
        0,
        0,
        [
          17, 45, 9, 35, 4, 29, 2, 19, 3, 12, 18, 13, 19, 16, 7, 14, 6, 20, 9,
          28, 14, 35, 19, 44,
        ],
        [
          30, 46, 24, 38, 21, 31, 12, 20, 7, 14, 1, 10, 4, 8, 12, 14, 17, 20,
          25, 30, 27, 38, 33, 45,
        ],
        [
          62, 45, 64, 44, 70, 31, 65, 18, 56, 13, 44, 10, 42, 13, 52, 15, 62,
          20, 67, 32,
        ],
        [
          90, 45, 92, 45, 88, 36, 83, 28, 83, 21, 86, 13, 94, 14, 93, 9, 84, 12,
          79, 20, 79, 28, 84, 36,
        ],
      ],
    ],
    rInt(100, 200),
  );

  this.n = () => {
    if (+new Date() - fanLast < 100) {
      return false;
    }
    particles.addFan(new V(this.x, this.y));
    fanLast = +new Date();
  };

  this.r = () => {
    c.save();
    c.translate(this.x + 60, this.y + 41);
    c.scale(1, -1);
    draw.r(anim.n(), [120, 81]);
    c.restore();
  };
}

function SawBlock(type, x, y, w, h, d) {
  this.type = type;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.d = d;
  this.active = true;
  this.collisionRadius = 35;

  const func = [
    () => {
      velocity += acc;
      angle += velocity;

      if (velocity <= -0.5) nextFunc();
    },
    () => {
      velocity *= 0.97;
      angle += velocity;
      const current = original.get().add(this.d.get().mult(shift));
      this.x = current.x;
      this.y = current.y;
      if (shift > 1 || shift < 0) {
        direction *= -1;
        nextFunc();
      }
      shift += step * direction;
    },
  ];
  const g = [
    [
      [
        19, 0, 28, 11, 27, 21, 13, 17, 0, 28, 12, 26, 20, 34, 10, 39, 7, 56, 16,
        45, 24, 46, 22, 56, 36, 68, 32, 56, 39, 48, 48, 58, 65, 56, 53, 50, 49,
        40, 63, 43, 76, 30, 62, 33, 52, 27, 64, 16, 54, 0, 54, 12, 41, 19, 33,
        4,
      ],
      "black",
      "black",
      1,
    ],
  ];
  const gHolder = [
    [
      [6, 6, 0, 22, 7, 37, 23, 41, 36, 35, 40, 22, 36, 7, 21, 0],
      "",
      "black",
      1,
    ],
    [[20, 17, 17, 21, 20, 24, 24, 23, 26, 18], "", "mechanics", 1],
  ];
  const speed = 6;
  let angle = 0;
  let acc = -0.015;
  let velocity = 0;
  let currentFunc = -1;

  let original = new V(x, y);
  let shift = 0;
  let step = 1 / Math.floor(d.mag() / speed);
  let direction = 1;

  function nextFunc() {
    currentFunc++;
    if (currentFunc === func.length) {
      currentFunc = 0;
    }
  }

  nextFunc();

  this.n = () => {
    func[currentFunc]();
  };

  this.center = () => new V(this.x + 15, this.y + 15);

  this.r = () => {
    c.save();
    c.translate(this.x + 18, this.y + 18);
    c.scale(1, -1);
    c.rotate(angle);
    draw.r(g, [76, 68]);
    c.restore();

    // Holder 1
    c.save();
    c.translate(original.x + 18, original.y + 18);
    draw.r(gHolder, [40, 40]);
    c.restore();

    // Holder 2
    c.save();
    c.translate(original.x + d.x + 18, original.y + d.y + 18);
    draw.r(gHolder, [40, 40]);
    c.restore();
  };
}

function BrokenBlock(type, x, y, w, h, d) {
  this.type = type;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.d = d;

  this.active = true;
  this.isMovable = d.mag() > 0;

  this.falling = {
    active: false,
    falling: false,
    dead: false,
    position: new V(),
    velocity: new V(),
    opacity: 1,
    start: 0,
  };

  const g = [
    [
      [0, 0, 40, 0, 39, 33, 33, 29, 26, 37, 16, 31, 9, 29, 7, 38, 0, 34],
      "",
      "black",
      1,
    ],
  ];
  const gHolder = [
    [[12, 0, 0, 22, 11, 40, 40, 36, 40, 4], "", "black", 1],
    [[19, 16, 16, 20, 19, 24, 24, 23, 26, 17], "", "mechanics", 1],
  ];
  const speed = 2;

  let original = new V(x, y);
  let shift = 0;
  let step = this.isMovable ? 1 / Math.floor(d.mag() / speed) : 0;
  let direction = 1;

  this.startFalling = () => {
    if (this.falling.active) return;
    sfx.fallingBlock();
    this.falling.active = true;
    this.falling.start = +new Date();
  };

  this.getVelocity = () => new V();

  this.n = () => {
    if (this.isMovable && !this.falling.falling) {
      const current = original.get().add(this.d.get().mult(shift));
      this.x = current.x;
      this.y = current.y;
      if (shift > 1 || shift < 0) {
        direction *= -1;
      }
      shift += step * direction;
    }

    if (this.falling.active && !this.falling.falling) {
      if (+new Date() - this.falling.start < 1000) return;
      this.falling.falling = true;
      this.active = false;
      this.falling.position = new V(this.x, this.y);
    } else if (this.falling.falling && !this.falling.dead) {
      const acc = this.falling.velocity.get().normalize().mult(-0.017);
      acc.add(gc.gravity.get().mult(0.3));
      this.falling.velocity.add(acc);
      this.falling.position.add(this.falling.velocity);
      this.x = this.falling.position.x;
      this.y = this.falling.position.y;
      this.falling.opacity -= 0.04;
      if (this.falling.opacity < 0) {
        this.falling.dead = true;
        this.falling.opacity = 0;
        setTimeout(() => {
          this.falling.active = false;
          this.falling.falling = false;
          this.falling.velocity = new V();
          this.falling.dead = false;
          this.active = true;
          this.x = x;
          this.y = y;
        }, 2000);
      }
    }

    if (!this.falling.active) {
      this.falling.opacity += 0.05;
      if (this.falling.opacity > 1) this.falling.opacity = 1;
    }
  };

  this.r = () => {
    if (this.isMovable) {
      // Holder 1
      c.save();
      c.translate(original.x + w / 2, original.y + h / 2);
      draw.r(gHolder, [40, 40]);
      c.restore();

      // Holder 2
      c.save();
      c.translate(original.x + d.x + w / 2, original.y + d.y + h / 2);
      draw.r(gHolder, [40, 40]);
      c.restore();

      // Line
      c.save();
      c.strokeStyle = color.mechanics;
      c.moveTo(original.x + w / 2, original.y + h / 2);
      c.lineTo(original.x + d.x + w / 2, original.y + d.y + h / 2);
      c.stroke();
      c.restore();
    }

    c.save();
    c.translate(this.x + 20, this.y + 20);
    c.globalAlpha = this.falling.opacity;
    c.scale(1, -1);
    for (let i = 0; i < Math.floor(this.w / 40); i++) {
      c.save();
      if (this.falling.active) {
        c.translate(i * 40 + rInt(-1, 1), rInt(-1, 1));
      } else {
        c.translate(i * 40, 0);
      }
      draw.r(g, [40, 38]);
      c.restore();
    }
    c.globalAlpha = 1;
    c.restore();
  };
}

function Block(type, x, y, w, h, d) {
  this.type = type;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.d = d;
  this.isMovable = d.mag() > 0;
  this.active = true;

  const colors = [color.black, color.black, color.ice, color.black];
  const nails = [
    [
      [0, 8, 40, 8, 35, 0, 34, 6, 23, 1, 21, 5, 15, 7, 11, 1, 8, 6, 3, 1],
      "black",
      "black",
      1,
    ],
  ];
  const gHolder = [
    [[12, 0, 0, 22, 11, 40, 40, 36, 40, 4], "", "black", 1],
    [[19, 16, 16, 20, 19, 24, 24, 23, 26, 17], "", "mechanics", 1],
  ];
  const speed = 2;

  let original = new V(x, y);
  let shift = 0;
  let step = this.isMovable ? 1 / Math.floor(d.mag() / speed) : 0;
  let direction = 1;

  this.n = () => {
    if (this.isMovable) {
      const current = original.get().add(this.d.get().mult(shift));
      this.x = current.x;
      this.y = current.y;
      if (shift > 1 || shift < 0) {
        direction *= -1;
      }
      shift += step * direction;
    }
  };

  this.getVelocity = () =>
    d
      .get()
      .normalize()
      .mult(speed * direction);

  this.r = () => {
    if (this.isMovable) {
      // Holder 1
      c.save();
      c.translate(original.x + w / 2, original.y + h / 2);
      draw.r(gHolder, [40, 40]);
      c.restore();

      // Holder 2
      c.save();
      c.translate(original.x + d.x + w / 2, original.y + d.y + h / 2);
      draw.r(gHolder, [40, 40]);
      c.restore();

      // Line
      c.save();
      c.strokeStyle = color.mechanics;
      c.moveTo(original.x + w / 2, original.y + h / 2);
      c.lineTo(original.x + d.x + w / 2, original.y + d.y + h / 2);
      c.stroke();
      c.restore();
    }

    c.save();
    c.translate(this.x, this.y);
    if (this.type === 1) {
      // TOP
      c.save();
      c.scale(1, -1);
      c.translate(-20, -this.h - 4);
      for (let i = 0; i < Math.floor(this.w / 40); i++) {
        c.translate(40, 0);
        draw.r(nails, [40, 8]);
      }
      c.restore();
      // BOTTOM
      c.save();
      c.translate(-20, -4);
      for (let i = 0; i < Math.floor(this.w / 40); i++) {
        c.translate(40, 0);
        draw.r(nails, [40, 8]);
      }
      c.restore();
      // RIGHT
      c.save();
      c.rotate(Math.PI / 2);
      c.translate(-20, -this.w - 4);
      for (let i = 0; i < Math.floor(this.h / 40); i++) {
        c.translate(40, 0);
        draw.r(nails, [40, 8]);
      }
      c.restore();
      // LEFT
      c.save();
      c.rotate(-Math.PI / 2);
      c.translate(-this.h - 20, -4);
      for (let i = 0; i < Math.floor(this.h / 40); i++) {
        c.translate(40, 0);
        draw.r(nails, [40, 8]);
      }
      c.restore();
      c.fillStyle = color.black;
      c.fillRect(0, 0, this.w, this.h);
    } else {
      c.fillStyle = colors[this.type];
      c.fillRect(0, 0, this.w, this.h);
    }
    c.restore();
  };
}

window.map = (() => {
  const scale = 40;
  let currentLevel = 0;
  const levels = [
    // #1
    [
      [0, 10, 0, 30, 9],
      [0, 0, 0, 10, 50],
      [0, 13, 17, 27, 33],
      [0, 19, 9, 21, 2],
      [0, 19, 15, 21, 2],
      [6, 14, 9, 1, 1],
      [7, 39, 11, 1, 1],
    ],
    // #2
    [
      [0, 0, 0, 8, 11],
      [0, 8, 0, 13, 4],
      [0, 44, 0, 2, 4],
      [0, 46, 0, 2, 7],
      [0, 0, 14, 28, 16],
      [0, 28, 10, 14, 20],
      [0, 42, 13, 28, 17],
      [1, 32, 0, 2, 1],
      [0, 21, 0, 11, 1],
      [0, 34, 0, 10, 1],
      [7, 69, 7, 1, 1],
      [6, 0, 11, 1, 1],
      [0, 51, 0, 19, 7],
    ],
    // #3
    [
      [0, 0, 0, 7, 7],
      [0, 7, 0, 14, 1],
      [0, 23, 3, 6, 1],
      [0, 31, 0, 10, 1],
      [0, 7, 1, 1, 5],
      [0, 8, 1, 1, 4],
      [0, 9, 1, 1, 3],
      [0, 10, 1, 1, 2],
      [0, 11, 1, 1, 1],
      [0, 55, 0, 4, 1],
      [0, 62, 0, 4, 1],
      [0, 69, 0, 21, 1],
      [0, 0, 11, 22, 19],
      [0, 22, 19, 68, 11],
      [0, 22, 13, 2, 6],
      [0, 24, 15, 2, 4],
      [0, 26, 17, 2, 2],
      [4, 41, 0, 1, 1],
      [4, 42, 0, 1, 1],
      [4, 43, 0, 1, 1],
      [4, 44, 0, 1, 1],
      [4, 45, 0, 1, 1],
      [4, 46, 0, 1, 1],
      [4, 47, 0, 1, 1],
      [4, 48, 0, 1, 1],
      [4, 49, 0, 1, 1],
      [4, 50, 0, 1, 1],
      [4, 51, 0, 1, 1],
      [4, 52, 0, 1, 1],
      [4, 53, 0, 1, 1],
      [4, 54, 0, 1, 1],
      [1, 69, 7, 4, 5],
      [1, 76, 9, 4, 6],
      [1, 83, 8, 6, 1],
      [6, 0, 7, 1, 1],
      [7, 89, 1, 1, 1],
    ],
    // #4
    [
      [0, 0, 0, 10, 1],
      [0, 10, 0, 4, 7],
      [0, 14, 0, 9, 9],
      [0, 27, 8, 3, 1],
      [4, 33, 8, 3, 1],
      [0, 39, 8, 3, 1],
      [4, 45, 8, 3, 1],
      [0, 51, 8, 3, 1],
      [0, 79, 0, 11, 1],
      [4, 73, 3, 2, 1],
      [0, 31, 16, 15, 2],
      [0, 26, 18, 25, 13],
      [0, 82, 7, 4, 3],
      [7, 89, 1, 1, 1],
      [6, 0, 1, 1, 1],
      [0, 57, 0, 12, 5],
      [1, 23, 0, 34, 1],
      [0, 57, 12, 12, 19],
    ],
    // #5
    [
      [0, 0, 0, 9, 1],
      [0, 11, 0, 1, 10],
      [0, 14, 0, 4, 7],
      [0, 33, 5, 1, 14],
      [0, 37, 14, 13, 2],
      [0, 25, 0, 5, 7],
      [0, 55, 11, 5, 1],
      [0, 68, 0, 1, 7],
      [0, 69, 0, 1, 5],
      [0, 63, 0, 5, 8],
      [0, 70, 0, 1, 3],
      [0, 0, 17, 4, 13],
      [0, 4, 15, 12, 15],
      [0, 16, 20, 6, 10],
      [0, 22, 23, 21, 11],
      [0, 43, 25, 27, 9],
      [0, 25, 13, 5, 1],
      [1, 76, 8, 6, 1],
      [6, 0, 1, 1, 1],
      [7, 89, 1, 1, 1],
      [0, 71, 0, 19, 1],
    ],
    // #6
    [
      [0, 0, 0, 40, 1],
      [6, 0, 1, 1, 1],
      [7, 39, 1, 1, 1],
      [0, 0, 8, 12, 16],
      [0, 12, 10, 3, 14],
      [0, 15, 11, 13, 13],
      [0, 28, 9, 5, 15],
      [0, 33, 7, 7, 17],
      [1, 19, 0, 5, 1],
      [1, 17, 7, 9, 1],
    ],
    // #7
    [
      [0, 0, 0, 15, 7],
      [0, 28, 0, 9, 7],
      [0, 56, 0, 14, 7],
      [0, 86, 0, 14, 12],
      [1, 15, 0, 13, 1],
      [1, 37, 0, 19, 1],
      [1, 70, 0, 16, 1],
      [6, 0, 7, 1, 1],
      [7, 99, 12, 1, 1],
      [0, 16, 6, 3, 1, 8, 0],
      [0, 38, 6, 3, 1, 14, 0],
      [0, 71, 6, 3, 1, 11, 5],
      [0, 15, 15, 12, 15],
      [0, 0, 17, 15, 13],
      [0, 27, 17, 17, 13],
      [0, 44, 11, 6, 19],
      [0, 50, 13, 21, 17],
      [0, 71, 16, 6, 14],
      [0, 77, 19, 23, 11],
    ],
    // #8
    [
      [0, 0, 0, 10, 1],
      [0, 11, 2, 3, 1, 7, 7],
      [0, 23, 0, 7, 11],
      [0, 49, 0, 15, 1],
      [0, 64, 0, 6, 4],
      [0, 32, 9, 4, 1, 9, -5],
      [1, 30, 0, 19, 1],
      [1, 10, 0, 13, 1],
      [0, 23, 16, 7, 16],
      [0, 6, 18, 17, 14],
      [0, 30, 20, 15, 12],
      [4, 50, 6, 3, 1],
      [4, 56, 8, 3, 1],
      [0, 64, 14, 6, 18],
      [0, 62, 20, 2, 12],
      [0, 45, 24, 17, 8],
      [7, 69, 4, 1, 1],
      [6, 0, 1, 1, 1],
    ],
    // #9
    [
      [0, 0, 0, 5, 4],
      [0, 35, 2, 4, 1, -29, 0],
      [0, 40, 0, 6, 4],
      [1, 14, 3, 1, 1],
      [1, 20, 3, 1, 1],
      [1, 25, 3, 1, 1],
      [1, 31, 3, 1, 1],
      [1, 5, 0, 35, 1],
      [1, 14, 9, 1, 7],
      [1, 20, 9, 1, 7],
      [1, 25, 9, 1, 7],
      [1, 31, 9, 1, 7],
      [0, 56, 0, 14, 1],
      [0, 72, 3, 1, 7],
      [0, 76, 5, 1, 8],
      [1, 76, 8, 1, 2],
      [0, 80, 6, 1, 10],
      [0, 84, 0, 16, 7],
      [0, 84, 11, 16, 19],
      [0, 62, 22, 22, 8],
      [0, 58, 9, 10, 13],
      [0, 45, 12, 13, 10],
      [0, 0, 22, 62, 8],
      [0, 5, 11, 2, 11],
      [0, 2, 13, 3, 9],
      [0, 7, 14, 5, 8],
      [2, 48, 3, 6, 1],
      [6, 0, 4, 1, 1],
      [7, 99, 7, 1, 1],
    ],
    // #10
    [
      [0, 0, 0, 10, 3],
      [0, 14, 4, 3, 1, 0, 9],
      [0, 22, 6, 1, 12],
      [0, 24, 11, 4, 1, 11, 0],
      [0, 37, 21, 29, 1],
      [0, 35, 12, 1, 4, 7, 0],
      [0, 44, 0, 22, 21],
      [1, 10, 0, 34, 1],
      [0, 33, 14, 1, 17],
      [0, 47, 22, 1, 1],
      [0, 48, 22, 1, 2],
      [0, 49, 22, 1, 3],
      [0, 52, 22, 1, 3],
      [0, 53, 22, 1, 2],
      [0, 54, 22, 1, 1],
      [0, 49, 30, 4, 8],
      [0, 53, 31, 5, 7],
      [0, 58, 33, 8, 5],
      [0, 39, 32, 10, 6],
      [0, 12, 35, 27, 3],
      [1, 50, 21, 2, 1],
      [7, 65, 22, 1, 1],
      [6, 0, 3, 1, 1],
    ],
    // #11
    [
      [0, 12, 9, 3, 1, 8, -7],
      [0, 24, 1, 1, 8],
      [5, 13, 2, 1, 1, 7, 7],
      [0, 26, 2, 3, 1, 9, 7],
      [5, 29, 6, 1, 1, 10, 0],
      [1, 10, 0, 40, 1],
      [0, 44, 2, 1, 15],
      [0, 0, 0, 10, 8],
      [0, 50, 0, 2, 15],
      [0, 68, 0, 2, 15],
      [0, 52, 0, 16, 12],
      [1, 52, 12, 16, 1],
      [0, 39, 23, 13, 12],
      [0, 15, 25, 24, 10],
      [0, 52, 22, 18, 13],
      [0, 54, 14, 2, 1, 11, 0],
      [6, 0, 8, 1, 1],
      [7, 69, 15, 1, 1],
    ],
    // #12
    [
      [8, 14, 0, 3, 1],
      [8, 17, 0, 3, 1],
      [8, 20, 0, 3, 1],
      [8, 23, 0, 3, 1],
      [8, 26, 0, 3, 1],
      [8, 29, 0, 3, 1],
      [8, 32, 0, 3, 1],
      [8, 35, 0, 3, 1],
      [8, 38, 0, 3, 1],
      [8, 41, 0, 3, 1],
      [0, 44, 0, 16, 6],
      [7, 59, 6, 1, 1],
      [6, 0, 6, 1, 1],
      [0, 0, 0, 14, 6],
      [0, 0, 12, 11, 13],
      [0, 11, 14, 11, 11],
      [0, 22, 11, 10, 14],
      [0, 32, 16, 10, 9],
      [0, 42, 13, 18, 12],
      [1, 12, 14, 9, 1],
      [1, 31, 12, 1, 3],
      [1, 34, 16, 7, 1],
    ],
    // #13
    [
      [0, 0, 0, 14, 1],
      [8, 11, 1, 3, 1],
      [0, 63, 0, 7, 26],
      [7, 69, 26, 1, 1],
      [6, 0, 1, 1, 1],
      [0, 17, 13, 19, 1],
      [5, 20, 13, 1, 1, 12, 0],
      [5, 32, 13, 1, 1, -12, 0],
      [8, 33, 14, 3, 1],
      [0, 40, 25, 14, 1],
      [0, 0, 12, 6, 28],
      [0, 6, 25, 21, 15],
      [0, 27, 34, 43, 6],
      [0, 0, 40, 70, 8],
      [0, 6, 18, 1, 7],
      [0, 7, 19, 1, 6],
      [0, 8, 20, 1, 5],
      [0, 9, 21, 1, 4],
      [0, 10, 22, 1, 3],
      [0, 11, 23, 1, 2],
      [0, 12, 24, 1, 1],
      [0, 31, 33, 4, 1],
      [0, 32, 32, 2, 1],
      [0, 32, 31, 1, 1],
    ],
    // #14
    [
      [0, 0, 0, 15, 8],
      [6, 0, 8, 1, 1],
      [8, 18, 1, 3, 1],
      [8, 24, 1, 3, 1],
      [8, 30, 1, 3, 1],
      [8, 36, 1, 3, 1],
      [0, 42, 0, 18, 1],
      [1, 15, 0, 27, 1],
      [7, 59, 1, 1, 1],
      [0, 0, 19, 60, 13],
      [0, 24, 18, 7, 1],
      [0, 25, 17, 5, 1],
      [0, 26, 16, 3, 1],
      [0, 27, 15, 1, 1],
      [1, 35, 19, 10, 1],
      [1, 27, 15, 1, 1],
      [1, 7, 19, 13, 1],
      [1, 50, 0, 2, 1],
      [0, 49, 8, 11, 11],
      [0, 46, 10, 3, 9],
      [1, 46, 11, 1, 7],
    ],
    // #15
    [
      [0, 0, 0, 13, 6],
      [2, 17, 5, 2, 1],
      [2, 23, 5, 2, 1],
      [2, 29, 5, 2, 1],
      [2, 35, 5, 2, 1],
      [2, 41, 5, 2, 1],
      [2, 47, 5, 2, 1],
      [1, 13, 0, 47, 1],
      [5, 15, 3, 1, 1, 11, 0],
      [5, 27, 3, 1, 1, 11, 0],
      [5, 50, 3, 1, 1, -11, 0],
      [2, 53, 5, 2, 1],
      [0, 60, 0, 10, 6],
      [0, 0, 14, 70, 25],
      [7, 69, 6, 1, 1],
      [6, 0, 6, 1, 1],
    ],
    // #16
    [
      [0, 0, 0, 2, 12],
      [0, 0, 12, 5, 1],
      [0, 8, 6, 1, 18],
      [0, 2, 4, 4, 1],
      [3, 10, 5, 1, 1],
      [0, 13, 6, 1, 12],
      [0, 0, 24, 59, 16],
      [0, 17, 6, 15, 1],
      [5, 17, 6, 1, 1, 11, 0],
      [8, 29, 7, 3, 1],
      [0, 40, 18, 1, 6],
      [3, 42, 16, 1, 1],
      [0, 44, 20, 8, 1],
      [0, 53, 0, 6, 16],
      [1, 53, 0, 1, 15],
      [7, 58, 16, 1, 1],
      [6, 0, 13, 1, 1],
      [1, 24, 20, 2, 1],
      [1, 23, 21, 4, 1],
      [1, 22, 22, 6, 1],
      [1, 21, 23, 8, 1],
      [0, 9, 23, 1, 1],
      [0, 39, 23, 1, 1],
      [1, 2, 0, 51, 1],
      [1, 1, 6, 1, 5],
      [0, 34, 18, 3, 1],
    ],
    // #17
    [
      [0, 0, 0, 50, 6],
      [0, 4, 16, 20, 1],
      [5, 5, 16, 1, 1, 18, 0],
      [0, 21, 48, 29, 2],
      [0, 47, 38, 3, 3],
      [7, 49, 41, 1, 1],
      [6, 0, 6, 1, 1],
      [1, 1, 21, 19, 1],
      [0, 24, 40, 3, 1],
      [0, 28, 42, 3, 1, 14, 0],
      [5, 36, 46, 1, 1, 0, -8],
      [0, 0, 11, 21, 1],
      [5, 2, 11, 1, 1, 17, 0],
      [0, 3, 30, 21, 1],
      [5, 22, 30, 1, 1, -18, 0],
      [0, 19, 24, 3, 1, -17, 0],
      [1, 11, 24, 2, 1],
      [0, 0, 50, 50, 8],
      [0, 24, 6, 26, 32],
      [1, 24, 37, 23, 1],
      [0, 0, 35, 21, 15],
      [0, 0, 12, 1, 23],
    ],
    // #18
    [
      [0, 0, 0, 15, 50],
      [6, 0, 50, 1, 1],
      [0, 0, 57, 30, 11],
      [0, 19, 48, 6, 1, 0, -42],
      [5, 17, 42, 1, 1, 9, 0],
      [5, 17, 32, 1, 1, 9, 0],
      [5, 17, 22, 1, 1, 9, 0],
      [1, 17, 14, 1, 3, 9, 0],
      [1, 15, 0, 45, 1],
      [0, 30, 3, 1, 9],
      [0, 37, 3, 1, 9],
      [0, 44, 3, 1, 9],
      [0, 51, 3, 1, 9],
      [0, 60, 0, 20, 12],
      [7, 79, 12, 1, 1],
      [8, 55, 0, 3, 1],
      [5, 37, 11, 1, 1, 0, -8],
    ],
    // #19
    [
      [0, 0, 0, 30, 1],
      [0, 30, 0, 20, 50],
      [8, 13, 1, 3, 1],
      [6, 0, 1, 1, 1],
      [7, 49, 50, 1, 1],
      [0, 18, 15, 3, 1, 8, 6],
      [0, 18, 20, 2, 1, -16, 0],
      [0, 5, 24, 1, 1, 0, 10],
      [1, 4, 31, 1, 1, 5, 0],
      [0, 8, 35, 1, 9],
      [0, 0, 48, 13, 1],
      [0, 12, 39, 1, 9],
      [0, 0, 5, 1, 43],
      [3, 14, 38, 1, 1],
      [0, 16, 39, 3, 1, 3, 3],
      [0, 0, 49, 21, 13],
      [0, 21, 57, 29, 5],
      [1, 30, 27, 1, 18],
      [0, 25, 45, 5, 1],
      [1, 0, 13, 1, 4],
      [1, 0, 7, 1, 3],
    ],
    // #20
    [
      [0, 0, 0, 10, 4],
      [3, 17, 5, 1, 1],
      [3, 21, 5, 1, 1],
      [3, 25, 5, 1, 1],
      [3, 29, 5, 1, 1],
      [1, 10, 0, 23, 1],
      [0, 33, 0, 17, 4],
      [6, 0, 4, 1, 1],
      [0, 35, 4, 15, 1],
      [0, 37, 5, 13, 1],
      [0, 39, 6, 11, 1],
      [0, 41, 7, 9, 1],
      [0, 43, 8, 7, 1],
      [0, 45, 9, 5, 1],
      [0, 47, 10, 3, 1],
      [7, 49, 11, 1, 1],
      [0, 0, 15, 50, 16],
      [2, 7, 10, 1, 5],
      [2, 11, 12, 1, 3],
      [2, 15, 12, 1, 3],
      [1, 19, 13, 1, 2],
      [2, 23, 12, 1, 3],
    ],
    // #21
    [
      [6, 0, 1, 1, 1],
      [0, 49, 0, 11, 1],
      [0, 0, 0, 12, 1],
      [0, 43, 0, 5, 1, -30, 0],
      [1, 22, 2, 1, 5],
      [3, 20, 8, 1, 1],
      [1, 31, 2, 5, 1],
      [3, 33, 5, 1, 1],
      [1, 45, 2, 1, 5],
      [3, 43, 8, 1, 1],
      [8, 57, 1, 3, 1],
      [0, 65, 0, 7, 17],
      [1, 65, 0, 1, 16],
      [0, 0, 23, 72, 16],
      [0, 0, 8, 12, 15],
      [0, 12, 12, 13, 12],
      [0, 25, 15, 27, 8],
      [7, 71, 17, 1, 1],
    ],
    // #22
    [
      [0, 0, 0, 10, 1],
      [8, 7, 1, 3, 1],
      [0, 13, 15, 2, 1],
      [3, 21, 18, 1, 1],
      [3, 25, 10, 1, 1],
      [0, 28, 9, 1, 10],
      [0, 25, 12, 1, 16],
      [0, 0, 28, 32, 18],
      [1, 28, 15, 1, 4],
      [3, 28, 22, 1, 1],
      [0, 32, 21, 3, 1, 0, -8],
      [3, 34, 37, 1, 1],
      [0, 0, 46, 77, 12],
      [0, 36, 42, 5, 1],
      [6, 0, 1, 1, 1],
      [0, 76, 4, 1, 42],
      [0, 74, 0, 3, 1],
      [0, 43, 39, 3, 1, 27, 0],
      [5, 47, 34, 1, 1, 8, 9],
      [5, 64, 43, 1, 1, 0, -8],
      [7, 76, 1, 1, 1],
    ],
    // #23
    [
      [0, 0, 0, 16, 1],
      [0, 16, 0, 1, 20],
      [1, 16, 6, 1, 1],
      [0, 44, 0, 6, 30],
      [7, 49, 30, 1, 1],
      [6, 0, 1, 1, 1],
      [1, 16, 11, 1, 1],
      [1, 16, 16, 1, 1],
      [0, 0, 4, 13, 21],
      [1, 12, 9, 1, 1],
      [1, 12, 14, 1, 1],
      [1, 12, 19, 1, 1],
      [0, 0, 25, 39, 19],
      [0, 20, 5, 1, 20],
      [1, 20, 14, 1, 1],
      [1, 20, 9, 1, 1],
      [1, 20, 19, 1, 1],
      [0, 24, 0, 1, 19],
      [0, 17, 0, 7, 1],
      [1, 25, 13, 19, 1],
      [0, 39, 34, 11, 10],
      [3, 32, 19, 1, 1],
      [3, 36, 19, 1, 1],
      [3, 40, 19, 1, 1],
    ],
    // #24
    [
      [0, 0, 0, 9, 1],
      [1, 12, 5, 1, 1],
      [1, 10, 9, 1, 1],
      [3, 18, 17, 1, 1],
      [0, 22, 15, 1, 12],
      [6, 0, 1, 1, 1],
      [0, 67, 0, 3, 1],
      [0, 69, 4, 1, 36],
      [7, 69, 1, 1, 1],
      [0, 26, 18, 1, 13],
      [1, 22, 16, 1, 1],
      [3, 26, 15, 1, 1],
      [3, 29, 16, 1, 1],
      [0, 32, 17, 1, 10],
      [0, 0, 31, 33, 9],
      [1, 26, 22, 1, 4],
      [0, 10, 13, 3, 1, 0, -11],
      [0, 0, 40, 2, 10],
      [0, 5, 45, 28, 1],
      [0, 0, 50, 62, 12],
      [0, 62, 40, 8, 22],
      [5, 5, 45, 1, 1, 12, 0],
      [0, 36, 45, 22, 1],
      [0, 58, 31, 3, 1],
      [8, 58, 32, 3, 1],
      [1, 34, 45, 1, 1],
      [5, 15, 45, 1, 1, 7, 0],
      [5, 32, 45, 1, 1, -7, 0],
    ],
    // #25
    [
      [2, 0, 9, 10, 1],
      [3, 17, 13, 1, 1],
      [3, 20, 15, 1, 1],
      [3, 23, 17, 1, 1],
      [3, 26, 19, 1, 1],
      [6, 0, 10, 1, 1],
      [3, 29, 21, 1, 1],
      [3, 32, 23, 1, 1],
      [3, 35, 25, 1, 1],
      [3, 38, 27, 1, 1],
      [3, 41, 25, 1, 1],
      [3, 44, 23, 1, 1],
      [3, 47, 21, 1, 1],
      [3, 50, 19, 1, 1],
      [3, 53, 17, 1, 1],
      [3, 56, 15, 1, 1],
      [3, 59, 13, 1, 1],
      [2, 63, 10, 5, 1],
      [2, 70, 10, 1, 1],
      [2, 73, 10, 1, 1],
      [2, 76, 10, 1, 1],
      [2, 79, 10, 1, 1],
      [2, 82, 8, 1, 1],
      [2, 85, 6, 1, 1],
      [2, 89, 0, 11, 1],
      [7, 99, 1, 1, 1],
    ],
    // #26
    [
      [0, 0, 0, 30, 1],
      [8, 11, 1, 3, 1],
      [0, 16, 17, 5, 1],
      [4, 10, 20, 3, 1],
      [4, 5, 23, 2, 1],
      [4, 11, 25, 1, 1],
      [4, 14, 29, 1, 1],
      [4, 8, 29, 1, 1],
      [4, 2, 29, 2, 1],
      [0, 0, 5, 1, 45],
      [0, 0, 50, 25, 4],
      [0, 30, 0, 13, 50],
      [0, 0, 54, 43, 15],
      [7, 42, 50, 1, 1],
      [6, 0, 1, 1, 1],
      [4, 17, 27, 2, 1, -1, 6],
      [1, 0, 20, 1, 3],
      [1, 0, 27, 1, 2],
      [1, 0, 33, 1, 3],
      [1, 0, 40, 1, 1],
      [1, 0, 45, 1, 3],
      [1, 0, 13, 1, 2],
      [0, 11, 33, 1, 1],
      [2, 14, 37, 2, 1],
      [4, 17, 41, 2, 1],
      [3, 23, 46, 1, 1],
      [3, 26, 48, 1, 1],
      [1, 30, 37, 1, 5],
      [1, 30, 33, 1, 1],
      [1, 30, 25, 1, 5],
    ],
    // #27
    [
      [0, 0, 8, 16, 2],
      [0, 0, 0, 7, 6],
      [0, 20, 7, 3, 1],
      [8, 20, 8, 3, 1],
      [0, 27, 18, 3, 1],
      [8, 27, 19, 3, 1],
      [0, 0, 31, 57, 15],
      [6, 0, 10, 1, 1],
      [0, 51, 0, 6, 27],
      [7, 56, 27, 1, 1],
      [0, 35, 16, 1, 15],
      [3, 36, 14, 1, 1],
      [3, 38, 15, 1, 1],
      [4, 39, 26, 1, 1],
      [4, 40, 26, 1, 1],
      [4, 41, 26, 1, 1],
      [4, 42, 26, 1, 1],
      [4, 43, 26, 1, 1],
      [4, 44, 26, 1, 1],
      [4, 45, 26, 1, 1],
      [4, 46, 26, 1, 1],
    ],
    // #28
    [
      [0, 0, 0, 8, 1],
      [0, 97, 0, 3, 50],
      [7, 99, 50, 1, 1],
      [3, 15, 4, 1, 1],
      [0, 18, 6, 1, 1],
      [0, 28, 6, 1, 19],
      [0, 17, 29, 17, 1],
      [3, 21, 24, 1, 1],
      [3, 18, 25, 1, 1],
      [3, 15, 26, 1, 1],
      [3, 13, 28, 1, 1],
      [0, 33, 10, 1, 19],
      [1, 33, 22, 1, 1],
      [1, 28, 17, 1, 1],
      [1, 33, 13, 1, 1],
      [3, 33, 7, 1, 1],
      [3, 36, 13, 1, 1],
      [3, 36, 22, 1, 1],
      [8, 25, 30, 3, 1],
      [0, 20, 45, 1, 1],
      [0, 30, 45, 1, 1],
      [2, 36, 45, 1, 1],
      [4, 39, 45, 1, 1],
      [2, 42, 45, 1, 1],
      [4, 45, 45, 1, 1],
      [0, 48, 45, 4, 1, 24, 0],
      [1, 57, 46, 1, 5],
      [3, 55, 51, 1, 1],
      [0, 82, 40, 3, 1],
      [0, 90, 40, 3, 1],
      [8, 82, 41, 3, 1],
      [8, 90, 41, 3, 1],
      [4, 48, 48, 1, 1],
      [0, 50, 53, 1, 1],
      [5, 62, 47, 1, 1, 10, 0],
      [6, 0, 1, 1, 1],
      [3, 25, 17, 1, 1],
    ],
    // #last
    [
      [0, 0, 0, 32, 1],
      [6, 0, 1, 1, 1],
      [7, 31, 1, 1, 1],
    ],
  ];
  let backward = false;

  let mapData = {
    map: [],
    enemy: [],
    start: new V(),
    end: new V(),
  };

  function initLevel() {
    mapData = {
      map: [],
      enemy: [],
      start: new V(),
      end: new V(),
    };
    levels[currentLevel].forEach((item) => {
      if (item[0] === 4) {
        mapData.map.push(
          new BrokenBlock(
            item[0],
            item[1] * scale,
            item[2] * scale,
            item[3] * scale,
            item[4] * scale,
            (typeof item[5] !== "undefined" ? new V(item[5], item[6]) : new V())
              .get()
              .mult(scale),
          ),
        );
      } else if (item[0] === 5) {
        mapData.enemy.push(
          new SawBlock(
            item[0],
            item[1] * scale,
            item[2] * scale,
            item[3] * scale,
            item[4] * scale,
            (typeof item[5] !== "undefined" ? new V(item[5], item[6]) : new V())
              .get()
              .mult(scale),
          ),
        );
      } else if (item[0] === 6) {
        mapData.start = new V(item[1] * scale, item[2] * scale);
      } else if (item[0] === 7) {
        mapData.end = new V(item[1] * scale, item[2] * scale);
      } else if (item[0] === 3) {
        mapData.enemy.push(
          new PowerBlock(item[0], item[1] * scale, item[2] * scale),
        );
      } else if (item[0] === 8) {
        mapData.enemy.push(
          new FanBlock(item[0], item[1] * scale, item[2] * scale),
        );
      } else {
        mapData.map.push(
          new Block(
            item[0],
            item[1] * scale,
            item[2] * scale,
            item[3] * scale,
            item[4] * scale,
            (typeof item[5] !== "undefined" ? new V(item[5], item[6]) : new V())
              .get()
              .mult(scale),
          ),
        );
      }
    });
  }

  return {
    i: () => {
      initLevel();
    },
    reset: () => {
      initLevel();
    },
    n: () => {
      mapData.map.forEach((item) => {
        item.n();
      });

      mapData.enemy.forEach((item) => {
        item.n();
      });
    },
    r: () => {
      mapData.map.forEach((item) => {
        item.r();
      });
      mapData.enemy.forEach((item) => {
        item.r();
      });
    },
    getMap: () => mapData,
    currentLevel: () => currentLevel,
    nextLevel: (direction) => {
      backward = direction === -1;
      currentLevel += direction;
    },
    getStart: () => mapData.start,
    getCharacterStart: () => (backward ? mapData.end : mapData.start),
    getEnd: () => mapData.end,
    isFirst: () => currentLevel === 0,
    isLast: () => currentLevel === levels.length - 1,
  };
})();

function Particle(mass, r, p, v, lifeTime, cc) {
  this.isActive = true;
  let position = p.get();
  let velocity = v.get();
  let acceleration = new V();
  const startTime = +new Date();

  this.n = () => {
    acceleration.add(velocity.get().normalize().mult(0.001));
    acceleration.add(gc.gravity.get().mult(mass));

    velocity.add(acceleration);
    position.add(velocity);
    acceleration.mult(0);

    if (+new Date() - startTime >= lifeTime) {
      this.isActive = false;
    }
  };

  this.r = () => {
    const opacity = 1 - (+new Date() - startTime) / lifeTime;
    c.save();
    c.translate(position.x + 20, position.y);
    c.globalAlpha = opacity >= 0 ? opacity : 0;
    bp();
    c.fillStyle = cc;
    c.rect(-(r / 2), -(r / 2), r * 2, r * 2);
    c.fill();
    cp();
    c.restore();
  };
}

window.particles = (function () {
  let list = [];
  let runningLast = +new Date();
  let wallLast = +new Date();

  return {
    reset: () => {
      list = [];
    },
    addRunning: (position, velocity) => {
      if (+new Date() - runningLast < 200) {
        return false;
      }
      const amount = 5;
      for (let i = 0; i < amount; i++) {
        list.push(
          new Particle(
            rFloat(0.1, 0.15),
            1,
            position.get(),
            new V(rFloat(-1, 1), rFloat(0.5, 0.5 + velocity.x / 5)),
            500,
            color.walking,
          ),
        );
      }
      runningLast = +new Date();
    },

    addWall: (position, sideDirection) => {
      if (+new Date() - wallLast < 200) {
        return false;
      }
      const amount = 5;
      for (let i = 0; i < amount; i++) {
        list.push(
          new Particle(
            rFloat(0.1, 0.15),
            1,
            position.get().add(new V(sideDirection * 20, 0)),
            new V(rFloat(-0.5, 0.5), rFloat(0.1, 0.5)),
            500,
            color.walking,
          ),
        );
      }
      wallLast = +new Date();
    },
    addJump: (position, velocityX) => {
      const amount = 50;
      for (let i = 0; i < amount; i++) {
        list.push(
          new Particle(
            rFloat(0.1, 0.15),
            1,
            position.get(),
            new V(rFloat(velocityX - 2, velocityX + 2), rFloat(0.5, 1)),
            500,
            color.walking,
          ),
        );
      }
    },
    addFan: (position) => {
      const amount = 1;
      for (let i = 0; i < amount; i++) {
        list.push(
          new Particle(
            rFloat(0.0001, 0.00015),
            2,
            position.get().add(new V(rInt(0, 100), rInt(0, 20))),
            new V(0, rFloat(1, 3)),
            2000,
            color.walking,
          ),
        );
      }
    },
    dying: (position, colors) => {
      const amount = 30;
      for (let i = 0; i < amount; i++) {
        list.push(
          new Particle(
            rFloat(0.1, 0.3),
            rInt(3, 10),
            position.get(),
            new V(
              rFloat(0.5, 2) * Math.sin(rFloat(0, Math.PI * 2)),
              rFloat(3, 4) * Math.cos(rFloat(0, Math.PI * 2)),
            ),
            500,
            colors[rInt(0, colors.length)],
          ),
        );
      }
    },
    takePower: (position) => {
      const amount = 30;
      for (let i = 0; i < amount; i++) {
        list.push(
          new Particle(
            rFloat(0.1, 0.3),
            rInt(1, 4),
            position.get(),
            new V(
              rFloat(0.5, 2) * Math.sin(rFloat(0, Math.PI * 2)),
              rFloat(3, 4) * Math.cos(rFloat(0, Math.PI * 2)),
            ),
            500,
            color.power,
          ),
        );
      }
    },
    n: () => {
      list = list.filter(function (particle) {
        particle.n();
        return particle.isActive;
      });
    },
    r: () => {
      list.forEach(function (particle) {
        particle.r();
      });
    },
  };
})();

window.camera = (() => {
  let position = new V();
  let to = new V();

  return {
    reset: () => {
      const characterPosition = character.position();

      position.apply(
        new V(
          characterPosition.x - gc.res.x / 2,
          characterPosition.y - gc.res.y / 2,
        ),
      );

      if (position.x < 0) {
        position.x = 0;
      }

      if (position.x + gc.res.x > map.getEnd().x + 40) {
        position.x = map.getEnd().x + 40 - gc.res.x;
      }

      if (position.y < 0) {
        position.y = 0;
      }
    },
    n: () => {
      const characterPosition = character.position();

      to.apply(
        new V(
          characterPosition.x - gc.res.x / 2,
          characterPosition.y - gc.res.y / 2,
        ),
      );

      if (to.x < 0) {
        to.x = 0;
      }

      if (to.x + gc.res.x > map.getEnd().x + 40) {
        to.x = map.getEnd().x + 40 - gc.res.x;
      }

      if (to.y < 0) {
        to.y = 0;
      }
      position.add(to.get().sub(position).mult(0.05));
    },
    r: () => {
      c.translate(-position.x, -position.y);
    },
    getPosition: () => position,
  };
})();

window.finalScene = (() => {
  const g = [
    [[8, 52, 11, 72, 16, 36], "", "black", 1],
    [[75, 36, 86, 53, 80, 72], "", "black", 1],
    [[39, 35, 56, 35, 67, 72, 26, 72], "", "rgba(255, 255, 255, .1)", 1],
    [[51, 0, 0, 36, 97, 37], "", "black", 1],
    [[36, 17, 15, 30, 33, 29], "", "red", 1],
    [[65, 17, 82, 31, 67, 29], "", "red", 1],
  ];
  let anim;
  let isStarted = false;
  let startedTime;
  let position = new V(1000, 147);
  let velocity = new V();
  let angle = 0;
  let scale = 3;

  return {
    i: () => {
      isStarted = true;
      startedTime = +new Date();
      anim = new Anim(
        g,
        [
          [0, 0, [39, 35, 56, 35, 56, 35, 38, 35], 0, 0, 0],
          [
            [33, 32, 47, 16, 16, 35],
            [76, 36, 56, 34, 46, 16],
            [39, 35, 56, 35, 57, 35, 38, 35],
            0,
            0,
            0,
          ],
        ],
        2000,
        true,
      );
    },
    n: () => {
      if (isStarted && +new Date() - startedTime > 2500) {
        angle += 0.01;
        if (angle > Math.PI / 4) {
          angle = Math.PI / 4;
        }
        scale -= 0.01;
        const acc = velocity.get().normalize().mult(-0.017);
        acc.add(new V(-0.2, 0.1));
        velocity.add(acc);
        position.add(velocity);
      }
    },
    r: () => {
      c.save();
      c.translate(100, 550);
      c.scale(1, -1);
      c.font = "120px Courier New";
      c.textAlign = "left";
      c.fillStyle = "white";
      c.fillText("THE END", 0, 0);
      c.translate(0, 100);
      c.font = "60px Courier New";
      c.fillText("Thanks for playing!", 10, 0);
      c.restore();

      c.save();
      c.translate(position.x, position.y);
      c.scale(scale, -scale);
      c.rotate(angle);
      draw.r(isStarted ? anim.n() : g, [97, 72]);
      c.restore();
    },
    rBackground: () => {
      let bg = c.createLinearGradient(0, 0, 0, gc.res.y);
      bg.addColorStop(0, "hsl(238, 10%, 30%)");
      bg.addColorStop(1, "hsl(238, 10%, 10%)");
      c.save();
      c.fillStyle = bg;
      // c.fillStyle = '#000000';
      c.fillRect(0, 0, gc.res.x, gc.res.y);
      c.restore();
    },
  };
})();

window.scene = (() => {
  let bg;

  return {
    i: () => {
      bg = c.createLinearGradient(0, 0, 0, gc.res.y);
      bg.addColorStop(0, "hsl(37, 30%, 45%)");
      bg.addColorStop(1, "hsl(37, 30%, 10%)");

      background.i();
      map.i();
      character.i();
    },
    reset: () => {
      background.reset();
      map.reset();
      character.reset();
      particles.reset();
      camera.reset();
    },
    n: () => {
      if (gc.splashScreen) {
        splashScreen.n();
      } else {
        background.n();
        map.n();
        if (map.isLast()) {
          character.nFinal();
          finalScene.n();
        } else {
          character.n();
        }
        particles.n();
        camera.n();
      }
    },
    r: () => {
      c.save();
      c.fillStyle = bg;
      c.fillRect(0, 0, gc.res.x, gc.res.y);
      c.restore();

      if (gc.splashScreen) {
        splashScreen.r();
      } else {
        if (map.isLast()) {
          finalScene.rBackground();
        } else {
          background.r();
        }

        c.save();
        camera.r();
        map.r();
        if (map.isLast()) {
          character.rFinal();
          finalScene.r();
        } else {
          character.r();
        }
        particles.r();
        c.restore();
      }

      c.save();
      c.translate(1250, 690);
      c.scale(0.3, 0.3);
      c.restore();
    },
  };
})();

window.sfx = (() => {
  let lastFX = +new Date();

  function playShort(frequency, time, volume) {
    const o = gc.ac.createOscillator();
    const g = gc.ac.createGain();
    o.type = "triangle";
    o.connect(g);
    g.connect(gc.ac.destination);
    o.frequency.value = frequency;
    o.start(0);
    g.gain.value = volume || 1;
    g.gain.exponentialRampToValueAtTime(
      0.00001,
      gc.ac.currentTime + (time || 0.5),
    );
  }

  return {
    fall: () => {
      playShort(43.65);
    },
    jump: () => {
      playShort(82.41, 0.2);
    },
    run: () => {
      if (+new Date() - lastFX < 200) return;
      playShort(146.83, 0.05, 0.4);
      lastFX = +new Date();
    },
    wall: () => {
      if (+new Date() - lastFX < 100) return;
      playShort(41.2, 0.2);
      lastFX = +new Date();
    },
    die: () => {
      playShort(61.74, 3);
    },
    fallingBlock: () => {
      playShort(51.91, 5);
    },
    takePower: () => {
      playShort(220.0, 0.5);
    },
    flying: () => {
      if (+new Date() - lastFX < 30) return;
      playShort(27.5, 0.5);
      lastFX = +new Date();
    },
  };
})();

window.splashScreen = (() => {
  return {
    n: () => {
      character.nSplashScreen();
    },
    r: () => {
      c.save();
      c.translate(500, 340);
      c.scale(1, -1);
      c.font = "120px Courier New";
      c.textAlign = "left";
      c.fillStyle = "white";
      c.fillText("Triangle:", 0, 0);
      c.translate(0, 100);
      c.font = "60px Courier New";
      c.fillText("Back To Home", 30, 0);

      c.translate(0, 160);
      c.font = "30px Courier New";
      c.fillText("(Click to Start)", -30, 0);
      c.restore();

      character.rSplashScreen();
    },
  };
})();

function Anim(g, a, s, f) {
  const SPEED = s || 200;
  const TOTAL = a.length + 1;
  const SLIDES = [];

  let index = 0;
  let t = 0;
  let tt = 0;
  let last = +new Date();
  let diff = last;
  let isFinished = false;
  let latestSlide;

  SLIDES.push(g);

  a.forEach((aa) => {
    SLIDES.push(
      g.map((item, i) => {
        let value = item;
        if (aa[i]) {
          value = item.map((item2, ii) => (!ii ? aa[i] : item2));
        }
        return value;
      }),
    );
  });

  this.n = () => {
    diff = +new Date() - last;
    t += diff;
    index = Math.floor((t % (TOTAL * SPEED)) / SPEED);
    if (index + 1 === TOTAL) {
      isFinished = true;
    }
    const nextIndex = index + 1 === TOTAL ? (f ? index : 0) : index + 1;
    tt = (t % (TOTAL * SPEED)) % SPEED;

    last = +new Date();
    latestSlide =
      f && isFinished
        ? SLIDES[TOTAL - 1]
        : SLIDES[index].map((slide, i) => {
            return slide.map((item, ii) => {
              if (!ii) {
                return item.map((item2, iii) => {
                  return (
                    item2 +
                    ((SLIDES[nextIndex][i][ii][iii] - item2) * tt) / SPEED
                  );
                });
              } else {
                return item;
              }
            });
          });
    return latestSlide;
  };

  this.isFinished = () => isFinished;
}

window.color = {
  mechanics: "hsl(60, 100%, 15%)",
  walking: "hsl(224, 4%, 5%)",
  dying1: "hsl(15, 85%, 41%)",
  dying2: "hsl(15, 85%, 60%)",
  dying3: "hsl(15, 85%, 10%)",
  dying4: "hsl(15, 85%, 30%)",
  black: "#141212",
  ice: "#001933",
  stamina: "#023609",
  power: "yellow",
  white: "#b4b5b8",
};

window.draw = (() => {
  let t = "transparent";
  return {
    r: (g, size, width) => {
      c.save();
      if (size) {
        c.translate(-size[0] / 2, -size[1] / 2);
      }
      g.forEach((p) => {
        bp();
        c.fillStyle = color[p[2]] || p[2] || t;
        c.strokeStyle = color[p[1]] || p[1] || t;
        c.lineWidth = !p[3] ? width : 0.001;
        c.lineJoin = "round";
        m(p[0][0], p[0][1]);
        for (let i = 2; i < p[0].length; i = i + 2) {
          l(p[0][i], p[0][i + 1]);
        }
        p[3] && cp();
        p[1] && c.stroke();
        p[3] && c.fill();
      });
      c.restore();
    },
  };
})();

function V(x, y) {
  this.x = x || 0;
  this.y = y || 0;

  this.add = (v) => {
    this.x += v.x;
    this.y += v.y;
    return this;
  };

  this.angle = (v) =>
    v ? Math.atan2(this.y, this.x) : Math.atan2(v.y - this.y, v.x - this.x);

  this.apply = (v) => {
    this.x = v.x;
    this.y = v.y;
    return this;
  };

  this.distance = (v) => Math.hypot(this.x - v.x, this.y - v.y);

  this.div = (n) => {
    this.x /= n;
    this.y /= n;
    return this;
  };

  this.dot = (v) => this.mag() * v.mag() * Math.cos(this.angle(v));

  this.get = () => new V(this.x, this.y);

  this.mag = () => Math.hypot(this.x, this.y);

  this.mult = (n) => {
    this.x *= n;
    this.y *= n;
    return this;
  };

  this.normalize = () => {
    if (this.mag() > 0) {
      this.div(this.mag());
    }
    return this;
  };

  this.perpendicular = () => {
    let x = this.x;
    this.x = this.y;
    this.y = -x;
    return this;
  };

  this.round = () => {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  };

  this.sub = (v) => {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  };

  this.normal = (v) =>
    new V(this.x - v.x, this.y - v.y).perpendicular().normalize();

  this.center = (v) =>
    new V(this.x + (v.x - this.x) / 2, this.y + (v.y - this.y) / 2);
}
