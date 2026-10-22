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

// Reference Vietnamese translation, grouped by dimension; original item IDs retained.
// Demerouti, Mostert & Bakker (2010), appendix, doi:10.1037/a0019408.
// 1=strongly disagree, 4=strongly agree. Positive items reverse as 5 - answer.
export const OLBI_LIKERT_LABELS = ['Hoàn toàn không đồng ý', 'Không đồng ý', 'Đồng ý', 'Hoàn toàn đồng ý'];
export const OLBI_16_QUESTIONS = {
  exhaustion: [
    { key: 'e1', originalId: 2, text: 'Có ngày tôi mệt trước khi đến làm.', reverse: false },
    { key: 'e2', originalId: 4, text: 'Sau việc, tôi cần lâu hơn trước để hồi phục.', reverse: false },
    { key: 'e3', originalId: 5, text: 'Tôi chịu được áp lực công việc rất tốt.', reverse: true },
    { key: 'e4', originalId: 8, text: 'Trong công việc, tôi thường cạn kiệt cảm xúc.', reverse: false },
    { key: 'e5', originalId: 10, text: 'Sau việc, tôi đủ sức cho hoạt động giải trí.', reverse: true },
    { key: 'e6', originalId: 12, text: 'Sau công việc, tôi thường mệt mỏi, rã rời.', reverse: false },
    { key: 'e7', originalId: 14, text: 'Tôi thường quản lý tốt khối lượng công việc.', reverse: true },
    { key: 'e8', originalId: 16, text: 'Khi làm việc, tôi thường thấy tràn đầy năng lượng.', reverse: true },
  ],
  disengagement: [
    { key: 'd1', originalId: 1, text: 'Tôi luôn tìm được điều mới, thú vị trong việc.', reverse: true },
    { key: 'd2', originalId: 3, text: 'Tôi ngày càng nói tiêu cực về công việc.', reverse: false },
    { key: 'd3', originalId: 6, text: 'Gần đây, tôi làm việc máy móc, ít suy nghĩ.', reverse: false },
    { key: 'd4', originalId: 7, text: 'Công việc là một thử thách tích cực với tôi.', reverse: true },
    { key: 'd5', originalId: 9, text: 'Dần dần, người ta có thể xa rời nghề này.', reverse: false },
    { key: 'd6', originalId: 11, text: 'Đôi lúc, nhiệm vụ công việc khiến tôi chán ngán.', reverse: false },
    { key: 'd7', originalId: 13, text: 'Tôi chỉ hình dung mình làm loại công việc này.', reverse: true },
    { key: 'd8', originalId: 15, text: 'Tôi cảm thấy ngày càng gắn bó với công việc.', reverse: true },
  ],
} as const;

export const DAILY_CHECKIN_INITIAL_STATE = {
  exhaustion: { e1: 0, e2: 0, e3: 0 },
  disengagement: { d1: 0, d2: 0, d3: 0 },
  job_demands: { jd1: 0, jd2: 0, jd3: 0 },
  sleep_hours: 7,
  recovery_score: 3,
  quick_overload: 2,
  overload_reasons: [] as string[],
} as const;

export const OLBI_16_INITIAL_STATE = {
  exhaustion: Object.fromEntries(OLBI_16_QUESTIONS.exhaustion.map(q => [q.key, 0])) as Record<string, number>,
  disengagement: Object.fromEntries(OLBI_16_QUESTIONS.disengagement.map(q => [q.key, 0])) as Record<string, number>,
};
