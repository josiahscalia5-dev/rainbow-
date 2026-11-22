# Rainbow reference inventory (round 42, 2026-11-22) - the 11 approved screens + the 2 new scene designs

Authority: the user's approved artwork. The 11 approved screens in `references/` are byte-identical to the original kit ZIP of 2026-11-15
(`backups/source-package/Rainbow_11_Screen_Claude_Code_Kit.zip`) and pass `sha256sum -c scripts/reference.sha256`. They are JPEG data with
`.png` names (never re-saved / renamed). The 2 new designs are byte-identical to the pictures the user attached in this session.
NOT RECEIVED: the user's new ZIP (`Approved/Rainbow_APPROVED_Screen_NN_*.jpg`, `New_candidates/A_Bubble_Dash_Chamber.webp`, `B_Sock_Rescue_Tunnel.webp`) did not
reach this session; its files must still be compared byte-by-byte / pixel-by-pixel with the list below before anything is replaced (nothing replaced).

| order | screen | role | file in the repo (authoritative) | user's ZIP name | size | sha256 (16) |
|---|---|---|---|---|---|---|
| 1 | 01 Inside Washer, Girl and Towel | Flow video | `references/01_inside_washer_girl_and_towel.png` | `Rainbow_APPROVED_Screen_01_inside_washer_girl_and_towel.jpg` | 864x1536 | `99509fb6f6528a7e` |
| 2 | 02 Mascot Tumbles in Whirlpool | Flow video | `references/02_mascot_tumbles_in_whirlpool.png` | `Rainbow_APPROVED_Screen_02_mascot_tumbles_in_whirlpool.jpg` | 864x1536 | `50eec332c50b136a` |
| 3 | 03 Whirlpool Twirl | Flow video | `references/03_whirlpool_twirl.png` | `Rainbow_APPROVED_Screen_03_whirlpool_twirl.jpg` | 727x1536 | `6f298ac5183ededf` |
| 4 | 04 Through the Five Arrows | playable 3D | `references/04_through_the_five_arrows.png` | `Rainbow_APPROVED_Screen_04_through_the_five_arrows.jpg` | 864x1536 | `1b0ccdacbb4c97e9` |
| 5 | A Bubble Dash Chamber (new) | playable 3D - built | `references/candidates/bonus_bubble_dash_chamber.webp` | `New_candidates/A_Bubble_Dash_Chamber.webp` | 941x1672 | `5998f9d02e217ba9` |
| 6 | B Sock Rescue Tunnel (new) | playable 3D - built | `references/candidates/bonus_sock_rescue_laundry_tunnel.webp` | `New_candidates/B_Sock_Rescue_Tunnel.webp` | 941x1672 | `793f8824e6b2455b` |
| 7 | 05 Flow Into the Current | playable 3D | `references/05_flow_into_the_current.png` | `Rainbow_APPROVED_Screen_05_flow_into_the_current.jpg` | 864x1536 | `d3f339d49199598e` |
| 8 | 06 Crest the Rinse Arch | playable 3D - in progress | `references/06_crest_the_rinse_arch.png` | `Rainbow_APPROVED_Screen_06_crest_the_rinse_arch.jpg` | 864x1536 | `3946058c0893e97a` |
| 9 | 07 Dive the Washer Tube | playable 3D | `references/07_dive_the_washer_tube.png` | `Rainbow_APPROVED_Screen_07_dive_the_washer_tube.jpg` | 864x1536 | `75782e387240d794` |
| 10 | 08 Final Spin Chamber | playable 3D | `references/08_final_spin_chamber.png` | `Rainbow_APPROVED_Screen_08_final_spin_chamber.jpg` | 864x1536 | `ab7d0bc5777bc9b2` |
| 11 | 09 Ride the Final Wave | playable 3D | `references/09_ride_the_final_wave.png` | `Rainbow_APPROVED_Screen_09_ride_the_final_wave.jpg` | 864x1536 | `260e9504b7b10d61` |
| 12 | 10 Slide Into Hiding | playable 3D | `references/10_slide_into_hiding.png` | `Rainbow_APPROVED_Screen_10_slide_into_hiding.jpg` | 864x1536 | `c0db71df8dc88c07` |
| 13 | 11 Safely Home, Final Victory | Flow video | `references/11_safely_home_final_victory.png` | `Rainbow_APPROVED_Screen_11_safely_home_final_victory.jpg` | 864x1536 | `4f30ca59a926d6ee` |

Gameplay order (user, 2026-11-22): 04 -> A Bubble Dash Chamber -> B Sock Rescue Tunnel -> 05 -> 06 -> 07 -> 08 -> 09 -> 10; 01-03 + 11 = Google Flow videos.
The built section (tools/reflock, public/section) already sits in that place: the game hands over at the end of 04 and resumes at 05.
Storyboard: `STORYBOARD_13_in_gameplay_order.jpg` (this folder).
