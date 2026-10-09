# Ben 10 Alien Clash 3D — Android prototype

This native Godot 4.3 branch converts the arena into a real 3D scene and uses the supplied rigged Heatblast and Diamondhead GLB models unchanged. Their Idle_Breathe, Walk_Narrow and Run_Narrow clips are crossfaded according to actual movement speed. Acceleration, braking, turning and camera tracking are smoothed independently. It includes orbit camera, collision, jumping, dodge, six abilities, AI combat, rounds, pause and touch controls.

Four Arms and XLR8 are not included: matching rigged 3D assets are still needed. This is a two-character prototype, not completion of the requested four-character exact-match conversion. Model quality and deformation are inherited from the supplied meshes and clips; performance requires testing on the target Android phone.

Controls: left joystick moves relative to camera; drag the right side to rotate camera; ability buttons attack; JUMP and DODGE handle movement. Desktop uses arrow keys, right mouse drag, J/K/L, Space, Shift and Escape.

GitHub Actions imports assets, tests gameplay and animation transitions, renders actual screenshots and a short movement preview, then exports and publishes an installable test APK. Package org.alienclash.threed installs separately from the 2D version.
