'use client';

import { useState } from 'react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface RegionData {
    id: string;
    name: string;
    slug: string;
    unemployment: number | null;
    unemploymentMonth: string | null;
    unemploymentPrev: number | null;
    wages: number | null;
    wagesPrev: number | null;
    wagesYoY: number | null;
}

export interface MonthlyUnemployment {
    month: string; // e.g. "2025-09"
    label: string; // e.g. "wrzesień 2025"
    regions: Record<string, number>; // slug → rate
}

interface PolandMapProps {
    regions: RegionData[];
    national: { avgUnemployment: number | null; avgWages: number | null };
    selectedRegion: string | null;
    onRegionSelect: (slug: string | null) => void;
    overrideRates?: Record<string, number>; // from period switcher
}

// ═══════════════════════════════════════════════════════════════
// COLOR LOGIC
// ═══════════════════════════════════════════════════════════════

function getUnemploymentColor(rate: number | null): string {
    if (rate === null) return '#1E293B';
    if (rate < 4) return '#059669';
    if (rate < 5) return '#10B981';
    if (rate < 6) return '#84CC16';
    if (rate < 7) return '#EAB308';
    if (rate < 8) return '#F97316';
    if (rate < 10) return '#EF4444';
    return '#DC2626';
}

function getHoverColor(rate: number | null): string {
    if (rate === null) return '#334155';
    if (rate < 4) return '#047857';
    if (rate < 5) return '#059669';
    if (rate < 6) return '#65A30D';
    if (rate < 7) return '#CA8A04';
    if (rate < 8) return '#EA580C';
    if (rate < 10) return '#DC2626';
    return '#B91C1C';
}

// ═══════════════════════════════════════════════════════════════
// GEOGRAPHIC SVG PATHS — from GeoJSON (ppatrzyk/polska-geojson)
// Mercator projection into 600×550 viewBox
// ═══════════════════════════════════════════════════════════════

const VOIVODESHIP_PATHS: Record<string, string> = {
    'slaskie': 'M 312.1,362 L 318.6,362.9 L 327.1,367.6 L 329.1,372.2 L 325.6,378.4 L 334.4,382.5 L 337.1,386.4 L 330.6,392.9 L 338.7,398.2 L 335.7,402.9 L 326.6,403.6 L 320.3,407 L 313.1,407.8 L 311.1,414.7 L 304.1,420 L 304.8,426.1 L 300.5,432.5 L 294.3,438.7 L 291.6,447.1 L 295.7,453.4 L 302.9,460.9 L 310.3,464.3 L 307.7,470.7 L 312.7,476 L 306.6,483 L 299.1,486 L 297.1,494.5 L 289.2,494.5 L 285,492.3 L 279,485.3 L 276.5,476.9 L 270,468.9 L 263.9,461.9 L 264.2,454.8 L 257.7,450.9 L 249.8,449.4 L 242.4,443 L 236.7,442.8 L 234.1,435.1 L 236.4,427.2 L 244,424 L 250.9,420.2 L 252.6,415.1 L 251.8,406.3 L 252.2,402.1 L 257.2,401 L 260.6,394.9 L 263.5,389.3 L 259,379.8 L 259.8,372 L 265.8,360.6 L 268.4,353.8 L 276.1,348.5 L 285.8,347.8 L 293,354.5 L 300.3,353.9 L 304.4,353.3 L 310.1,357.6 L 312.1,362 Z',
    'opolskie': 'M 220.6,342.6 L 233.1,342.9 L 240.2,340 L 248.4,342.7 L 256,344.3 L 259.7,342.1 L 265.4,347.7 L 269.4,353.1 L 265.3,357.5 L 261.8,369.2 L 262.5,377.1 L 259.3,384.7 L 264,392.6 L 257.4,394 L 257.8,401.3 L 252.2,402.1 L 251.4,406.1 L 252.8,413 L 254.5,420.8 L 248,422.4 L 241.2,426.3 L 234.6,429 L 231.2,438.1 L 230.5,441.5 L 221.4,443.3 L 217.5,437.5 L 211,431.2 L 210.4,427.7 L 210.5,427.6 L 215,425.6 L 216.4,420.7 L 215.1,414.3 L 209.8,419.3 L 208.7,418.7 L 208.7,418.6 L 208.1,418.3 L 206.9,418.9 L 199.9,420.6 L 194.9,417.4 L 190.3,413.8 L 183.6,409.2 L 176.5,405.9 L 172.8,400.4 L 179.1,400.8 L 180.9,393 L 189.1,387.4 L 187.9,379.8 L 191.8,372.8 L 194.9,367.6 L 196.2,361.7 L 199.5,357.4 L 204.1,353.5 L 207.7,344.7 L 209.2,337.8 L 217.4,338 L 220.6,342.6 Z',
    'wielkopolskie': 'M 167.4,122.3 L 173.8,129.4 L 189.2,130.9 L 194.9,137.8 L 195.6,149.7 L 194,158.6 L 193.6,170.9 L 202.9,182.6 L 203.2,196.8 L 203.7,206.7 L 213.1,208.9 L 221.3,210.1 L 230.8,218.3 L 239.5,221.2 L 250.4,218.2 L 260,222.1 L 268.3,228.8 L 278.2,235.4 L 287.8,236.8 L 291.2,247.9 L 283,254.9 L 272.5,259.4 L 272,271.7 L 264.8,280.8 L 255.5,284 L 250.6,296.2 L 250.8,306.8 L 242.3,316.3 L 237.2,327 L 240.9,334.9 L 231.8,343.3 L 219.6,337.4 L 216,323.4 L 215.5,318.7 L 206,315.4 L 204.5,302.4 L 187.2,300.5 L 176.1,306 L 164.4,302.2 L 156,294.1 L 150.6,285.6 L 138.2,276.2 L 128.1,272.7 L 118.5,264.6 L 112.8,258.5 L 113.9,241.1 L 111,229 L 112.9,221.1 L 110.2,207.2 L 117.1,196.7 L 118.7,186.8 L 123.5,175.9 L 140.4,167.7 L 148.2,162.6 L 155.5,154.8 L 149.9,144.6 L 152.5,135.5 L 161.6,125.2 L 167.4,122.3 Z',
    'zachodniopomorskie': 'M 141,50.5 L 158.5,39.2 L 162.7,46.6 L 166.9,53.7 L 165.9,59.7 L 168.1,63.9 L 159.9,70.7 L 163.3,77.7 L 165.3,84 L 167,89.7 L 173,97.2 L 168.3,102.6 L 172.6,107.1 L 169.8,119.9 L 165.4,122.1 L 160.7,127.7 L 155.9,135.1 L 144.6,137.1 L 149.5,145.4 L 156.7,149.5 L 155.5,154.8 L 152.3,157.4 L 148.1,163.4 L 142.5,163.4 L 140.6,170.6 L 130.8,174.9 L 121,174.9 L 115.6,166.9 L 109,172.6 L 105,178.8 L 96.9,179 L 88.4,179.3 L 81.4,183.8 L 67.4,190.1 L 59.9,188.1 L 57.8,191.3 L 54.9,197.9 L 51.4,207.4 L 45.3,207.9 L 33.4,204.7 L 27.8,198.8 L 16.8,191.5 L 17.7,182.1 L 26.1,176.1 L 30.9,168 L 32.6,158.1 L 32.5,150.6 L 30.4,139.6 L 26.9,129.8 L 25.7,119.6 L 21.8,101.4 L 25.1,96.2 L 32.6,96.6 L 46.9,89.2 L 72.8,79.7 L 95.8,72.9 L 112.1,68.2 L 131.8,61.7 L 141,50.5 Z',
    'swietokrzyskie': 'M 327.5,366.3 L 332.1,358.2 L 334.5,350.4 L 339.2,354.3 L 344.1,353.7 L 341,345.6 L 344.4,336.6 L 353.4,336.9 L 354.8,332.8 L 361,332.4 L 361.6,327.3 L 367,324.8 L 371.1,330.7 L 375.8,334.2 L 380,341.3 L 386.8,340.6 L 394.8,339.1 L 400.5,339.1 L 402,340 L 405.1,347.4 L 420.5,351.9 L 426.7,350.3 L 434,347.6 L 440.4,348.5 L 441.9,353.7 L 442.6,364.8 L 444.2,373.3 L 440.5,383.1 L 435.7,387.4 L 429.3,397.2 L 421.2,402.5 L 410.9,408.3 L 406.4,413.7 L 400.8,414.1 L 394.2,414.9 L 387.1,418.5 L 381.8,422.2 L 376.4,424.2 L 370.8,425.9 L 362.7,424.5 L 359.8,419.2 L 359.5,414.7 L 359.4,410.4 L 355.8,403.8 L 350.6,400 L 342.9,397.9 L 335,394.9 L 331.8,391.3 L 337.1,386.4 L 333.6,383.6 L 331,378.8 L 325.2,375.5 L 329.5,370.6 L 327.5,366.3 Z',
    'kujawsko-pomorskie': 'M 268.3,116.8 L 271.9,122 L 283.1,125.9 L 297.2,127.5 L 299.2,136.5 L 303,142.6 L 311.5,146.1 L 318.6,148.5 L 325.5,152.3 L 327.7,161.6 L 321.5,169.6 L 323.2,178.4 L 317.6,179.1 L 311.1,184.4 L 310.7,192.2 L 314.2,198.9 L 311.9,202.5 L 309,207.8 L 307.1,215.9 L 306,223.7 L 302,227.9 L 297.7,234.9 L 287.8,236.8 L 282.3,232.7 L 272.7,236.8 L 267.3,228.9 L 261.9,223.4 L 256.6,224.1 L 250,220.1 L 242,223.2 L 236.9,218.6 L 229.5,216.4 L 222.4,210.7 L 217.1,210.3 L 210.6,206.2 L 203.7,206.7 L 198.7,196.9 L 204.2,192.1 L 201,182.2 L 194.1,176.2 L 197.2,165.1 L 196.1,157.8 L 197.5,152.3 L 189.4,144.3 L 197.5,133 L 199.4,125.8 L 210.3,125.9 L 214.6,125.3 L 217.4,117.8 L 225.2,115.1 L 229.3,112.6 L 237.1,110.9 L 246.1,113.2 L 256.8,116.4 L 261.4,119.9 L 268.3,116.8 Z',
    'podlaskie': 'M 447.8,170.9 L 443.2,170.9 L 435.7,163.2 L 433.2,156.8 L 433.5,150.4 L 432.8,147 L 431.3,141.9 L 430.5,135.4 L 444.1,137.3 L 449.3,132.8 L 456.1,130.5 L 466.9,123.9 L 475.3,117.6 L 480.3,116.1 L 488.9,111 L 495.3,99.8 L 490.1,89.5 L 485.3,82.3 L 481.5,76 L 481.1,69.2 L 490.2,65.2 L 495.7,60.7 L 499.1,53.2 L 507.7,55.7 L 512.2,63.1 L 519.5,65.5 L 526.9,68.9 L 530.6,73.8 L 534.9,79.5 L 535.3,88.5 L 536.1,100.8 L 539.3,112.1 L 544,132.6 L 554.7,158.3 L 556.7,166.2 L 556.8,173.4 L 557.8,183.2 L 556.9,205.1 L 539.6,213.7 L 526.8,224.7 L 517,241.2 L 509.8,240.4 L 505.3,234.1 L 493.5,232.2 L 488.7,232.1 L 482.7,229.4 L 480.2,223.7 L 475,213.2 L 476.3,207.4 L 476.2,196.3 L 471.1,199.3 L 466.4,194.1 L 467.8,190.8 L 463.4,188.2 L 457.5,190 L 453.3,187.9 L 452.5,183 L 448,179.1 L 448.6,174.5 L 447.8,170.9 Z',
    'dolnoslaskie': 'M 143.5,285.2 L 156.1,290.7 L 163.7,297.9 L 171.1,305.2 L 181.7,303.6 L 193.9,297.3 L 207.5,306 L 206.3,318.2 L 215.7,317.2 L 216.8,323.9 L 219.6,337.4 L 208.6,339.6 L 205.2,350.7 L 199.9,359.8 L 196.9,366.7 L 190.4,374.7 L 188.7,385.7 L 179.1,395.4 L 174.1,399.6 L 171.8,412.3 L 175.6,423.8 L 167.3,424.5 L 155.9,432.9 L 150.2,421.7 L 140.4,411.6 L 131.4,405 L 138.1,398 L 142.7,388.2 L 132.7,386.6 L 123.7,388.7 L 117.1,382.2 L 110.2,376.1 L 99.3,374.6 L 88.2,372.8 L 80,361.8 L 75.7,356.2 L 70.9,355.1 L 70.7,354.7 L 71.2,353.8 L 70.9,353.4 L 66.4,352.5 L 65.6,353.3 L 66.2,357.4 L 59.6,366.2 L 60,357.3 L 65.1,343.7 L 66,327.9 L 72.4,315.8 L 84.2,315 L 91.2,309 L 102.7,309.2 L 111.3,299.5 L 115.6,290.4 L 121.5,283.7 L 133.1,292.8 L 141.4,288 L 143.5,285.2 Z',
    'podkarpackie': 'M 481.9,411.4 L 487.4,411.2 L 488.9,411.6 L 485.5,415.4 L 489.8,416.4 L 499.1,416.8 L 517.3,407.9 L 528.6,407 L 531.2,412.3 L 535.5,418.2 L 528.1,428.8 L 519.1,438.6 L 506.9,456.8 L 498.7,468.4 L 488.5,483.6 L 493,501.5 L 492.2,513.8 L 493.9,517.7 L 499.9,524.3 L 498.7,530.9 L 492.5,526.8 L 485,522.9 L 477.1,522 L 468.3,518.7 L 462.6,515.8 L 454.1,509.5 L 448.1,500.6 L 443.1,496.6 L 436.6,494.9 L 429.9,492.7 L 423.5,493.5 L 419.3,489.3 L 416.5,483.2 L 415.5,477.6 L 414.1,466.8 L 410.2,461.9 L 414.2,457.4 L 412.6,450.8 L 405.6,446 L 404.7,438 L 407.2,432.2 L 405.9,425 L 407.4,416 L 410.9,408.3 L 421.6,401.4 L 431.1,394.7 L 438,385 L 442.5,379.2 L 446.1,374 L 457.1,370.9 L 461.2,382 L 468.9,388.4 L 475.5,391.2 L 480.6,394.4 L 483.8,398.3 L 484.3,400.7 L 477.5,401.7 L 476.1,407.5 L 481.9,411.4 Z',
    'malopolskie': 'M 372.5,425.2 L 379.4,423.6 L 385.9,417.3 L 395.1,415.1 L 403.4,411.8 L 408.4,413.6 L 406.1,424.5 L 407.2,432.2 L 405,438.8 L 406.1,447.8 L 409.1,453.1 L 414.9,460.2 L 412.7,465 L 416.4,473.8 L 416.8,482.2 L 419.3,489.3 L 411.4,490.8 L 402.9,493.7 L 399.7,499.2 L 391.7,504 L 384.5,498 L 378.2,495.4 L 369.6,496.4 L 362.6,496.6 L 357.6,500.1 L 350.9,502.2 L 347,511.5 L 340.4,510.7 L 331.5,513.5 L 330.7,506.9 L 330,497.7 L 321.2,494.7 L 319.2,490.7 L 317.8,489.9 L 316.8,487.9 L 312.1,478.5 L 309,471.7 L 309.9,466.9 L 305.5,463 L 297.1,455.2 L 295.1,448.2 L 294.1,440.3 L 298.5,435.1 L 305.3,428.3 L 308.9,422.2 L 308.5,415.1 L 311.6,410.7 L 318.1,406.9 L 324.5,404.4 L 331.8,404.1 L 339.3,400.7 L 345.6,397.8 L 355.1,400.8 L 359.4,410.4 L 360.4,415.9 L 362.8,422.3 L 369.7,426.1 L 372.5,425.2 Z',
    'pomorskie': 'M 322,49.5 L 302.8,67.9 L 299.8,74.7 L 300.9,85 L 306.7,89.3 L 310.3,95.5 L 316.9,96.1 L 313.8,106.6 L 302.7,108.8 L 298.5,118.8 L 293.3,125.9 L 281.5,126.6 L 271.8,120.9 L 268.3,116.8 L 260.1,118.8 L 254.1,117.1 L 246.1,113.2 L 238.2,109.9 L 230.5,113.8 L 223.2,111.1 L 220.3,117.8 L 216.2,120.6 L 212,125.4 L 207.7,126.7 L 199,126.4 L 197.5,133 L 192.8,131.5 L 183.6,130.9 L 174.6,128.7 L 170,123 L 171.3,109.4 L 168.7,103.2 L 173,97.2 L 164.9,90.1 L 164.3,82.8 L 161.9,74.4 L 165.6,67.7 L 165.9,59.7 L 166.9,54.3 L 162.7,46.6 L 162.7,39.2 L 189.1,25.1 L 212.6,20.3 L 243.9,15.8 L 267.5,26.7 L 274,35.3 L 263.9,25.2 L 253.4,22.2 L 257.1,32.1 L 261.5,40.2 L 263.7,51.6 L 270.6,55.9 L 285.6,59 L 316.4,52.5 L 322,49.5 Z',
    'warminsko-mazurskie': 'M 495.7,57.4 L 494.3,63.9 L 485.6,66.5 L 479.6,73 L 485.2,77.4 L 486.6,85.3 L 491.4,93.3 L 492,104.2 L 485.6,114.3 L 478,117.9 L 471.4,120.7 L 463.5,126.8 L 453.6,133.9 L 446.5,134.3 L 438.2,135.2 L 425.3,135.7 L 417.4,140.6 L 404.5,144.5 L 396.7,146.3 L 392.1,149.4 L 385.4,150.7 L 379.7,152 L 373.2,156.6 L 366.7,156 L 361,164.8 L 350.5,164.6 L 343.6,163.8 L 336.3,162.2 L 332.5,163.4 L 327.4,159.2 L 325.5,152.3 L 320,148 L 314.9,145.1 L 309.4,144.4 L 302.3,143.5 L 298.7,137.1 L 298,130.2 L 293.4,124.1 L 298.5,118.8 L 303,110.1 L 311.6,108.7 L 315.7,100.1 L 315.8,94.4 L 306.8,95.2 L 304.1,87.7 L 299.3,83.8 L 299.8,74.7 L 303,68.8 L 313.6,59 L 359.8,54.1 L 376.3,57.1 L 394.4,58.2 L 411.8,60.5 L 424.1,60.9 L 450.2,60.1 L 466.3,59.4 L 489.5,57.7 L 495.7,57.4 Z',
    'lodzkie': 'M 341,342.7 L 344.1,353.7 L 337.9,353.5 L 333.9,354.1 L 328.9,365.3 L 320.3,365.1 L 311.8,363.7 L 307.6,354.5 L 304,350.4 L 295.3,355 L 290.2,351.4 L 281.7,345.8 L 271.4,348.6 L 265.4,347.7 L 259.5,344.5 L 253.4,343.5 L 245.3,340.6 L 240.8,335 L 237,331.5 L 236.4,322.5 L 242.3,316.3 L 250.9,313.2 L 251.8,301.5 L 251.1,294.3 L 254.7,286.2 L 257.7,279.4 L 266.4,280.8 L 272.3,274.3 L 271.5,265.9 L 275.8,260.2 L 283.4,255.6 L 284.2,247.9 L 291.7,242.7 L 289.5,236.8 L 298.6,234.2 L 304.3,234.3 L 313.9,236.7 L 321.2,241.9 L 328.9,242.8 L 338.1,240.6 L 344.9,248.6 L 352.6,256 L 352.5,263.5 L 356.1,272.3 L 362.9,271.3 L 369,275.9 L 375.6,282 L 373.6,288.4 L 375.7,296.4 L 365.7,294.3 L 367.3,305 L 370.5,313.1 L 365.5,320 L 361.6,327.3 L 358.6,333 L 355.3,336.2 L 345.2,337.3 L 341,342.7 Z',
    'mazowieckie': 'M 452.4,186.3 L 460.2,191.4 L 466.9,192 L 472.7,197.4 L 476.7,209.6 L 482.5,225.3 L 491.7,233.2 L 509.2,237.1 L 509.3,249.9 L 501.4,258.9 L 488.7,259.1 L 477.1,263.6 L 463.7,265 L 449,266.8 L 445.6,278.5 L 444,287.4 L 442.6,297.2 L 430.7,299.9 L 444.9,312.8 L 443.5,322.3 L 442.5,330.9 L 440.4,348.5 L 426.7,350.3 L 405.1,347.4 L 400.5,339.1 L 386.8,340.6 L 375.8,334.2 L 367,324.8 L 370.3,311.9 L 363.3,297 L 376.6,294.8 L 373.3,282 L 367.7,272.3 L 356.3,271.9 L 356.3,259.4 L 344.9,248.6 L 334.7,240.6 L 320.1,241.8 L 306,236 L 300.7,227.7 L 304,219.4 L 310,206.8 L 314.9,200.1 L 312.4,189.7 L 317.1,179.7 L 323,174.5 L 332.5,165.3 L 343.3,164.8 L 360,164.9 L 372.5,157.8 L 383.7,150 L 396.2,145.9 L 415.4,140.8 L 430.3,138.1 L 435.8,149.6 L 433.7,159.4 L 444.9,172.6 L 445.5,177.2 L 452.4,186.3 Z',
    'lubelskie': 'M 445.8,272.5 L 451.8,265.1 L 460.3,263.7 L 471,266.4 L 482.1,262.2 L 487.8,257.9 L 498.8,260.1 L 504.2,255.1 L 510.8,245.2 L 518.2,245.9 L 529.2,250.4 L 534,252.5 L 540.9,257.5 L 545.2,266.9 L 541.3,274.7 L 542.5,283.4 L 536.3,290 L 537.1,301.5 L 541.5,310.7 L 545.3,319.3 L 543.4,329.1 L 549.6,336.8 L 554.5,345.7 L 560.7,358.8 L 570.4,366 L 560,372.7 L 566.4,379.2 L 567.4,391.8 L 551.5,407.1 L 537.4,420.6 L 530.8,416.1 L 528.6,407 L 510.8,414.3 L 492.6,416.1 L 485.5,415.4 L 488.9,411.6 L 487.4,411.2 L 478.5,411.5 L 477.1,402.9 L 484.3,400.7 L 482.6,398.2 L 479.9,391.2 L 471.2,388.6 L 461.2,382 L 454.2,371.3 L 444.4,371.9 L 441.9,357.7 L 440.5,345.7 L 441.3,332.8 L 440.3,328.6 L 440.3,319.5 L 444.9,312.8 L 434.1,303.5 L 436.1,298.4 L 443.1,295.6 L 442.8,288.8 L 448.7,281.5 L 446.5,275.3 L 445.8,272.5 Z',
    'lubuskie': 'M 63.8,322.3 L 63.4,315.1 L 55.3,309.7 L 50.2,303.7 L 51.9,296.2 L 46,287.3 L 44.4,278.7 L 49.7,271.4 L 51.4,262.5 L 47.8,255.1 L 49.5,245.2 L 41.8,239.9 L 39.6,230.7 L 44.9,221.8 L 42.9,212.2 L 50.5,209.6 L 54.7,198.6 L 57.8,191.3 L 60.7,187.6 L 69,192.2 L 84.6,182.9 L 94.7,177.3 L 101.8,178.7 L 109.8,173.9 L 115.6,166.9 L 118.1,175.8 L 119.4,188.4 L 115.1,192.4 L 117.4,201.8 L 110.1,206.2 L 109.2,212.7 L 114.1,223.1 L 110.9,226.3 L 115,232.4 L 113.9,241.1 L 114,252.4 L 116.1,260 L 120.2,263.1 L 126.3,266.4 L 126.5,274.7 L 134,276.1 L 141.9,279.7 L 142.3,286.7 L 138.5,292.5 L 132.5,291.5 L 124.5,285.8 L 119.9,286.6 L 114.5,290.1 L 112.3,297.1 L 105.2,305.7 L 102.1,310.4 L 98.1,313 L 86.5,307.8 L 83.4,316.6 L 76.5,314 L 66.2,319.7 L 63.8,322.3 Z',
};

const LABEL_POS: Record<string, [number, number]> = {
    'slaskie': [289, 416],
    'opolskie': [223, 392],
    'wielkopolskie': [196, 233],
    'zachodniopomorskie': [104, 132],
    'swietokrzyskie': [376, 373],
    'kujawsko-pomorskie': [259, 173],
    'podlaskie': [488, 150],
    'dolnoslaskie': [135, 350],
    'podkarpackie': [464, 446],
    'malopolskie': [357, 455],
    'pomorskie': [239, 85],
    'warminsko-mazurskie': [387, 111],
    'lodzkie': [309, 304],
    'mazowieckie': [405, 240],
    'lubelskie': [496, 331],
    'lubuskie': [90, 253],
};

// Map slug from API → SVG path key
const SLUG_TO_PATH: Record<string, string> = {
    'malopolskie': 'malopolskie',
    'slaskie': 'slaskie',
    'lubuskie': 'lubuskie',
    'wielkopolskie': 'wielkopolskie',
    'zachodniopomorskie': 'zachodniopomorskie',
    'dolnoslaskie': 'dolnoslaskie',
    'opolskie': 'opolskie',
    'kujawsko-pomorskie': 'kujawsko-pomorskie',
    'pomorskie': 'pomorskie',
    'warminskomazurskie': 'warminsko-mazurskie',
    'lodzkie': 'lodzkie',
    'swietokrzyskie': 'swietokrzyskie',
    'lubelskie': 'lubelskie',
    'podkarpackie': 'podkarpackie',
    'podlaskie': 'podlaskie',
    'mazowieckie': 'mazowieckie',
};

// ═══════════════════════════════════════════════════════════════
// TOOLTIP
// ═══════════════════════════════════════════════════════════════

function Tooltip({ region, avgWages, x, y }: {
    region: RegionData; avgWages: number | null; x: number; y: number
}) {
    const wageVsAvg = region.wages && avgWages
        ? +((region.wages / avgWages - 1) * 100).toFixed(1) : null;
    const unempChange = region.unemployment !== null && region.unemploymentPrev !== null
        ? +(region.unemployment - region.unemploymentPrev).toFixed(1) : null;

    return (
        <div className="absolute z-50 pointer-events-none"
            style={{ left: x, top: y, transform: 'translate(-50%, -110%)' }}>
            <div className="bg-gray-900/95 backdrop-blur border border-bb-border rounded-lg px-3 py-2 shadow-2xl min-w-[210px]">
                <div className="font-semibold text-bb-accent text-sm mb-1.5">{region.name}</div>
                <div className="space-y-1 text-xs">
                    <div className="flex justify-between gap-4">
                        <span className="text-bb-muted">Bezrobocie:</span>
                        <span className="font-mono font-bold" style={{ color: getUnemploymentColor(region.unemployment) }}>
                            {region.unemployment !== null ? `${region.unemployment}%` : 'N/A'}
                            {unempChange !== null && (
                                <span className={`ml-1 text-[10px] ${unempChange > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                    ({unempChange > 0 ? '+' : ''}{unempChange}pp)
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between gap-4">
                        <span className="text-bb-muted">Wynagrodzenie:</span>
                        <span className="font-mono text-bb-text">
                            {region.wages ? `${Math.round(region.wages).toLocaleString()} PLN` : 'N/A'}
                        </span>
                    </div>
                    {wageVsAvg !== null && (
                        <div className="flex justify-between gap-4">
                            <span className="text-bb-muted">vs średnia:</span>
                            <span className={`font-mono ${wageVsAvg >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {wageVsAvg >= 0 ? '+' : ''}{wageVsAvg}%
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// MAP
// ═══════════════════════════════════════════════════════════════

export default function PolandMap({ regions, national, selectedRegion, onRegionSelect, overrideRates }: PolandMapProps) {
    const [hovered, setHovered] = useState<string | null>(null);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

    const getRegion = (slug: string) => regions.find(r => r.slug === slug);
    const getRate = (slug: string): number | null => {
        if (overrideRates && overrideRates[slug] !== undefined) return overrideRates[slug];
        return getRegion(slug)?.unemployment ?? null;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    const hoveredData = hovered ? getRegion(hovered) : null;

    return (
        <div className="relative" onMouseMove={handleMouseMove}>
            <svg viewBox="0 0 580 550" className="w-full h-auto" style={{ maxHeight: '65vh' }}>
                {Object.entries(SLUG_TO_PATH).map(([slug, pathKey]) => {
                    const path = VOIVODESHIP_PATHS[pathKey];
                    if (!path) return null;
                    const rate = getRate(slug);
                    const isHovered = hovered === slug;
                    const isSelected = selectedRegion === slug;

                    return (
                        <g key={slug}>
                            <path
                                d={path}
                                fill={isHovered ? getHoverColor(rate) : getUnemploymentColor(rate)}
                                stroke={isSelected ? '#FF6B00' : '#0F172A'}
                                strokeWidth={isSelected ? 2.5 : 1}
                                className="cursor-pointer transition-all duration-150"
                                onMouseEnter={() => setHovered(slug)}
                                onMouseLeave={() => setHovered(null)}
                                onClick={() => onRegionSelect(selectedRegion === slug ? null : slug)}
                                opacity={isHovered || isSelected ? 1 : 0.88}
                            />
                            {LABEL_POS[pathKey] && (
                                <text
                                    x={LABEL_POS[pathKey][0]}
                                    y={LABEL_POS[pathKey][1]}
                                    fill="white"
                                    fontSize="11"
                                    fontWeight="bold"
                                    fontFamily="monospace"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="pointer-events-none select-none"
                                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
                                >
                                    {rate !== null ? `${rate}%` : ''}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>

            {hoveredData && (
                <Tooltip region={hoveredData} avgWages={national.avgWages} x={tooltipPos.x} y={tooltipPos.y} />
            )}
        </div>
    );
}
