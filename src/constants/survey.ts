// Survey Constants - Daily Check-in v3.0
// Based on OLBI (Oldenburg Burnout Inventory) & JD-R (Job Demands-Resources) Model

export const DEFAULT_LIKERT_LABELS: [string, string, string, string, string] = [
  'Hoàn toàn không đồng ý',
  'Không đồng ý',
  'Trung lập / Bình thường',
  'Đồng ý',
  'Hoàn toàn đồng ý',
];

export const RECOVERY_LIKERT_LABELS: [string, string, string, string, string] = [
  'Rất mệt mỏi',
  'Mệt mỏi nhẹ',
  'Bình thường',
  'Khá thoải mái',
  'Rất sảng khoái',
];

export const OVERLOAD_LIKERT_LABELS: [string, string, string, string, string] = [
  'Hoàn toàn không',
  'Rất ít',
  'Thỉnh thoảng / Vừa phải',
  'Quá tải nhiều',
  'Quá tải nghiêm trọng',
];

export const OVERLOAD_REASONS = [
  'Quá nhiều việc',
  'Áp lực deadline gấp',
  'Xử lý nhiều việc cùng lúc',
  'Thiếu sự hỗ trợ từ đồng nghiệp/cấp trên',
  'Khó chủ động / Bị động trong công việc',
  'Khác',
] as const;

export const INDUSTRY_OPTIONS = [
  { code: 'tech', label: 'Công nghệ & Kỹ thuật', icon: '💻', desc: 'Dev, IT, Data, AI, Kỹ sư' },
  { code: 'sales', label: 'Kinh doanh & Bán hàng', icon: '💼', desc: 'Sales, BD, Account, CSKH' },
  { code: 'finance', label: 'Tài chính & Kế toán', icon: '💰', desc: 'Kế toán, Kiểm toán, Ngân hàng' },
  { code: 'marketing', label: 'Marketing & Truyền thông', icon: '📣', desc: 'Content, Ads, PR, Media' },
  { code: 'design', label: 'Thiết kế & Nghệ thuật', icon: '🎨', desc: 'UI/UX, Graphic, Video, Nghệ thuật' },
  { code: 'healthcare', label: 'Y tế & Chăm sóc sức khỏe', icon: '🏥', desc: 'Bác sĩ, Điều dưỡng, Dược sĩ' },
  { code: 'education', label: 'Giáo dục & Đào tạo', icon: '📚', desc: 'Giáo viên, Giảng viên, Đào tạo' },
  { code: 'legal_public', label: 'Pháp lý & Hành chính công', icon: '⚖️', desc: 'Luật sư, Pháp chế, Công chức' },
  { code: 'production', label: 'Sản xuất & Vận hành', icon: '🏭', desc: 'Nhà máy, Vận hành, QA/QC' },
  { code: 'services_logistics', label: 'Dịch vụ, Du lịch & Logistics', icon: '🚚', desc: 'Nhà hàng, Khách sạn, Kho vận, Tài xế' },
  { code: 'science_research', label: 'Khoa học & Nghiên cứu', icon: '🔬', desc: 'Nghiên cứu viên, R&D, Thí nghiệm' },
  { code: 'construction_realestate', label: 'Xây dựng, Kiến trúc & BĐS', icon: '🏗️', desc: 'Kỹ sư công trường, Kiến trúc, Môi giới' },
  { code: 'general_office', label: 'Văn phòng & Khác', icon: '🏢', desc: 'Khối chuyên môn & văn phòng tổng quát' },
] as const;

export const RISK_LEVEL_CONFIG = {
  critical: {
    label: 'NGUY CƠ NGHIÊM TRỌNG',
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-300',
    badgeColor: 'bg-red-100 text-red-800',
  },
  high: {
    label: 'NGUY CƠ KIỆT SỨC CAO',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-800',
    borderColor: 'border-orange-300',
    badgeColor: 'bg-orange-100 text-orange-800',
  },
  medium: {
    label: 'NGUY CƠ TRUNG BÌNH',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-300',
    badgeColor: 'bg-yellow-100 text-yellow-800',
  },
  low: {
    label: 'TRẠNG THÁI ỔN ĐỊNH',
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
    borderColor: 'border-green-300',
    badgeColor: 'bg-green-100 text-green-800',
  },
} as const;

export const TREND_LABELS = {
  increasing: { label: 'Tăng', icon: '↑', color: 'text-red-600' },
  decreasing: { label: 'Giảm', icon: '↓', color: 'text-green-600' },
  stable: { label: 'Ổn định', icon: '→', color: 'text-gray-600' },
} as const;

export const DIMENSION_LABELS = {
  exhaustion: { label: 'Kiệt sức', icon: '🔥', color: 'text-red-600' },
  disengagement: { label: 'Mất gắn kết', icon: '💔', color: 'text-purple-600' },
  job_demands: { label: 'Áp lực công việc', icon: '⚡', color: 'text-orange-600' },
  recovery: { label: 'Hồi phục', icon: '💚', color: 'text-green-600' },
  sleep: { label: 'Giấc ngủ', icon: '🌙', color: 'text-blue-600' },
} as const;

// Survey questions for Daily Check-in (9 items: E1-E3, D1-D3, JD1-JD3)
export const SURVEY_QUESTIONS = {
  exhaustion: [
    { key: 'e1', text: 'Hôm nay tôi cảm thấy khó duy trì năng lượng để tiếp tục công việc.' },
    { key: 'e2', text: 'Hôm nay công việc khiến tôi cảm thấy mình đã tiêu hao rất nhiều năng lượng.' },
    { key: 'e3', text: 'Sau khi kết thúc công việc hôm nay, tôi vẫn khó lấy lại sức.' },
  ],
  disengagement: [
    { key: 'd1', text: 'Hôm nay tôi muốn tránh hoặc hạn chế những việc liên quan đến công việc.' },
    { key: 'd2', text: 'Hôm nay tôi cảm thấy mình ít quan tâm đến công việc hơn bình thường.' },
    { key: 'd3', text: 'Hôm nay tôi cảm thấy công việc của mình ít có ý nghĩa hơn bình thường.' },
  ],
  job_demands: [
    { key: 'jd1', text: 'Hôm nay tôi có quá nhiều việc phải hoàn thành.' },
    { key: 'jd2', text: 'Hôm nay tôi phải hoàn thành công việc trong thời gian quá ngắn.' },
    { key: 'jd3', text: 'Hôm nay tôi phải xử lý nhiều việc cùng lúc.' },
  ],
} as const;

// Full Validated OLBI 16-Item Questionnaire (Oldenburg Burnout Inventory)
export const OLBI_16_QUESTIONS = {
  exhaustion: [
    { key: 'e1', text: 'Tôi luôn cần một khoảng thời gian dài để phục hồi lại năng lượng sau giờ làm việc.', reverse: false },
    { key: 'e2', text: 'Sau khi đi làm về, tôi thường cảm thấy quá mệt mỏi để làm bất kỳ việc gì khác.', reverse: false },
    { key: 'e3', text: 'Sau công việc, tôi vẫn thường cảm thấy tràn đầy năng lượng và có nhiều thời gian rảnh.', reverse: true },
    { key: 'e4', text: 'Trong khi làm việc, tôi thường cảm thấy kiệt sức về mặt tinh thần.', reverse: false },
    { key: 'e5', text: 'Khi bắt đầu ca làm việc, tôi vẫn luôn cảm thấy sung sức và khỏe khoắn.', reverse: true },
    { key: 'e6', text: 'Chỉ cần nghĩ tới công việc vào buổi sáng là tôi đã cảm thấy mệt mỏi.', reverse: false },
    { key: 'e7', text: 'Tôi cảm thấy mình có đủ năng lượng để giải quyết tốt các nhiệm vụ trong ngày.', reverse: true },
    { key: 'e8', text: 'Công việc hiện tại khiến tôi cảm thấy cạn kiệt về cả thể chất lẫn tinh thần.', reverse: false },
  ],
  disengagement: [
    { key: 'd1', text: 'Càng ngày tôi càng cảm thấy ít hứng thú và ít muốn gắn bó với công việc của mình.', reverse: false },
    { key: 'd2', text: 'Tôi cảm thấy công việc mình đang làm thực sự có ý nghĩa và giá trị.', reverse: true },
    { key: 'd3', text: 'Đôi khi tôi có cảm giác thờ ơ và không còn quan tâm tới công việc nữa.', reverse: false },
    { key: 'd4', text: 'Tôi luôn tìm thấy những khía cạnh thú vị và động lực trong công việc.', reverse: true },
    { key: 'd5', text: 'Khi làm việc, tôi chỉ muốn hoàn thành cho xong nhiệm vụ chứ không còn nhiệt huyết.', reverse: false },
    { key: 'd6', text: 'Tôi cảm thấy tự hào và có nhiều niềm vui khi nhắc về công việc hiện tại.', reverse: true },
    { key: 'd7', text: 'Càng ngày tôi càng cảm thấy có khoảng cách và sự xa rời đối với công việc.', reverse: false },
    { key: 'd8', text: 'Tôi vẫn luôn giữ được sự tích cực và tinh thần cống hiến cho công việc.', reverse: true },
  ],
} as const;

export const DAILY_CHECKIN_INITIAL_STATE = {
  exhaustion: { e1: 3, e2: 3, e3: 3 },
  disengagement: { d1: 2, d2: 2, d3: 2 },
  job_demands: { jd1: 3, jd2: 3, jd3: 3 },
  sleep_hours: 7,
  recovery_score: 3,
  quick_overload: 2,
  overload_reasons: [] as string[],
} as const;

export const OLBI_16_INITIAL_STATE = {
  exhaustion: { e1: 3, e2: 3, e3: 3, e4: 3, e5: 3, e6: 3, e7: 3, e8: 3 } as Record<string, number>,
  disengagement: { d1: 3, d2: 3, d3: 3, d4: 3, d5: 3, d6: 3, d7: 3, d8: 3 } as Record<string, number>,
  sleep_hours: 7 as number,
  recovery_score: 3 as number,
};
