# Software Requirements Specification (SRS)
## React Chatbot with OpenAPI Integration

**Document Version:** 1.0  
**Date:** July 26, 2025  
**Project:** React AI English Tutor Chatbot  

---

## 1. GIỚI THIỆU

### 1.1 Mục đích tài liệu
Tài liệu này mô tả các yêu cầu chức năng và phi chức năng cho hệ thống React Chatbot với tích hợp OpenAPI - một ứng dụng web hỗ trợ học tiếng Anh thông qua trò chuyện với AI.

### 1.2 Phạm vi sản phẩm
Ứng dụng React Chatbot là một giao diện web full-screen cho phép người dùng:
- Trò chuyện với AI Assistant để cải thiện tiếng Anh
- Nhận phản hồi về ngữ pháp và cách diễn đạt
- Lưu trữ lịch sử cuộc trò chuyện
- Trải nghiệm giao diện hiện đại và responsive

### 1.3 Định nghĩa và từ viết tắt
- **SRS:** Software Requirements Specification
- **API:** Application Programming Interface
- **OpenAPI:** Giao thức API chuẩn cho AI/ML services
- **localStorage:** Công nghệ lưu trữ dữ liệu trên trình duyệt
- **React:** JavaScript library để xây dựng user interface
- **AI:** Artificial Intelligence

---

## 2. MÔ TẢ TỔNG QUAN

### 2.1 Tổng quan sản phẩm
React Chatbot là ứng dụng web single-page được xây dựng bằng React 18, tích hợp với OpenAPI để cung cấp trải nghiệm học tiếng Anh thông qua trò chuyện với AI. Ứng dụng hoạt động hoàn toàn trên trình duyệt web và không yêu cầu cài đặt phần mềm bổ sung.

### 2.2 Chức năng sản phẩm
- **Giao diện trò chuyện:** Interface chat hiện đại với typing indicators
- **Tích hợp AI:** Kết nối với OpenAPI để xử lý và phản hồi tin nhắn
- **Sửa lỗi tiếng Anh:** AI tutor chuyên về việc sửa ngữ pháp và gợi ý cải thiện
- **Lưu trữ cuộc trò chuyện:** Persistence data với localStorage
- **Rich text formatting:** Hỗ trợ markdown, code blocks, links
- **Responsive design:** Tương thích với các thiết bị khác nhau

### 2.3 Đặc điểm người dùng
- **Học viên tiếng Anh:** Mọi trình độ, từ cơ bản đến nâng cao
- **Độ tuổi:** 13+ (có khả năng sử dụng máy tính/điện thoại)
- **Kỹ năng công nghệ:** Cơ bản (biết sử dụng trình duyệt web)
- **Ngôn ngữ:** Tiếng Việt/Tiếng Anh

### 2.4 Ràng buộc
- Yêu cầu kết nối Internet để sử dụng OpenAPI
- Chỉ hoạt động trên các trình duyệt web hiện đại (Chrome, Firefox, Safari, Edge)
- Phụ thuộc vào availability của OpenAPI service
- Giới hạn 500 tokens per response từ AI

---

## 3. YÊU CẦU HỆ THỐNG

### 3.1 Yêu cầu chức năng

#### 3.1.1 Giao diện người dùng (UC001)
**Mô tả:** Cung cấp giao diện trò chuyện full-screen
**Luồng chính:**
1. Người dùng truy cập ứng dụng
2. Hệ thống hiển thị giao diện chat với tin nhắn chào mừng
3. Người dùng thấy input field để nhập tin nhắn
4. Giao diện hiển thị avatar bot, thông tin online status

**Input:** URL ứng dụng
**Output:** Giao diện chat đầy đủ
**Tiền điều kiện:** Trình duyệt web hỗ trợ JavaScript
**Hậu điều kiện:** Giao diện sẵn sàng nhận input

#### 3.1.2 Gửi tin nhắn (UC002)
**Mô tả:** Người dùng gửi tin nhắn và nhận phản hồi từ AI
**Luồng chính:**
1. Người dùng nhập tin nhắn vào input field
2. Người dùng nhấn Enter hoặc click nút Send
3. Hệ thống hiển thị tin nhắn user với timestamp
4. Hệ thống hiển thị typing indicator
5. Hệ thống gọi OpenAPI với tin nhắn và conversation history
6. Hệ thống hiển thị phản hồi AI với format đặc biệt

**Input:** Text message từ người dùng
**Output:** Tin nhắn phản hồi từ AI với corrections và suggestions
**Tiền điều kiện:** Kết nối Internet ổn định
**Hậu điều kiện:** Tin nhắn được lưu vào localStorage

#### 3.1.3 Lưu trữ cuộc trò chuyện (UC003)
**Mô tả:** Tự động lưu và khôi phục lịch sử trò chuyện
**Luồng chính:**
1. Mỗi khi có tin nhắn mới, hệ thống lưu vào localStorage
2. Khi người dùng reload trang, hệ thống khôi phục conversation
3. Hệ thống xử lý error nếu localStorage không available

**Input:** Messages array
**Output:** Dữ liệu persistent trong trình duyệt
**Tiền điều kiện:** Browser hỗ trợ localStorage
**Hậu điều kiện:** Dữ liệu được lưu trữ local

#### 3.1.4 Xóa lịch sử trò chuyện (UC004)
**Mô tả:** Người dùng có thể xóa toàn bộ lịch sử trò chuyện
**Luồng chính:**
1. Người dùng click nút trash icon trong header
2. Hệ thống xóa dữ liệu trong localStorage
3. Hệ thống reset về tin nhắn chào mừng ban đầu

**Input:** Click action trên clear button
**Output:** Chat history được reset
**Tiền điều kiện:** Có conversation history
**Hậu điều kiện:** localStorage được clear

#### 3.1.5 Format tin nhắn (UC005)
**Mô tả:** Hỗ trợ rich text formatting cho tin nhắn
**Luồng chính:**
1. Hệ thống nhận raw text từ OpenAPI
2. Parser chuyển đổi markdown syntax thành HTML
3. Hiển thị với styling tương ứng (bold, italic, code blocks, links)

**Input:** Raw text với markdown syntax
**Output:** Formatted HTML với CSS styling
**Tiền điều kiện:** Tin nhắn chứa markdown syntax
**Hậu điều kiện:** Tin nhắn hiển thị với formatting

### 3.2 Yêu cầu phi chức năng

#### 3.2.1 Hiệu suất (Performance)
- **Response time:** AI response < 5 giây trong điều kiện mạng bình thường
- **Loading time:** Ứng dụng load < 3 giây
- **Smooth scrolling:** Auto-scroll mượt mà đến tin nhắn mới nhất
- **Real-time typing:** Typing indicator hiển thị ngay lập tức

#### 3.2.2 Khả năng sử dụng (Usability)
- **Responsive design:** Hoạt động trên desktop, tablet, mobile
- **Intuitive interface:** Giao diện dễ sử dụng, không cần hướng dẫn
- **Keyboard support:** Hỗ trợ Enter để gửi tin nhắn
- **Visual feedback:** Clear indicators cho loading states

#### 3.2.3 Độ tin cậy (Reliability)
- **Error handling:** Graceful handling khi API fails
- **Offline behavior:** Thông báo rõ ràng khi mất kết nối
- **Data persistence:** Không mất dữ liệu khi reload page
- **Fallback responses:** Tin nhắn thay thế khi API error

#### 3.2.4 Bảo mật (Security)
- **API key protection:** Sử dụng environment variables
- **XSS protection:** Sanitize user input khi hiển thị
- **HTTPS:** Secure communication với API endpoints
- **No sensitive data storage:** Không lưu thông tin nhạy cảm

#### 3.2.5 Khả năng mở rộng (Scalability)
- **Configurable API:** Dễ dàng thay đổi endpoint và model
- **Modular design:** Components tách biệt, dễ maintain
- **Environment-based config:** Hỗ trợ multiple environments
- **Extensible formatting:** Dễ thêm formatting rules mới

---

## 4. KIẾN TRÚC HỆ THỐNG

### 4.1 Kiến trúc tổng thể
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │───▶│  React Frontend │───▶│   OpenAPI       │
│   (Client)      │    │   (localhost)   │    │   (Remote)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  localStorage   │    │  Configuration  │
│   (Browser)     │    │     Files       │
└─────────────────┘    └─────────────────┘
```

### 4.2 Cấu trúc thành phần
```
src/
├── components/
│   ├── Chatbot.js          # Main chatbot logic
│   └── Chatbot.css         # Styles
├── config.js               # API và UI configuration
├── App.js                  # Root component
├── App.css                 # Global styles
├── index.js                # Entry point
└── index.css               # Base styles
```

### 4.3 Data Flow
1. **User Input** → React State → **API Call**
2. **API Response** → State Update → **UI Render**
3. **Message Array** → localStorage → **Persistence**
4. **Page Load** → localStorage → **State Hydration**

---

## 5. GIAO DIỆN NGƯỜI DÙNG

### 5.1 Layout chính
- **Header:** Avatar bot, tên, status, clear button
- **Messages area:** Scrollable chat history
- **Input area:** Text input với send button

### 5.2 Responsive breakpoints
- **Desktop:** > 768px - Full layout
- **Tablet:** 768px - 480px - Adjusted spacing
- **Mobile:** < 480px - Compact layout

### 5.3 Color scheme
- **Primary gradient:** #667eea → #764ba2
- **User messages:** #007bff background
- **Bot messages:** #f8f9fa background
- **Text:** #333 primary, #666 secondary

---

## 6. API REQUIREMENTS

### 6.1 OpenAPI Integration
**Endpoint:** Configurable via environment variables
**Default:** `https://aiportalapi.stu-platform.live/jpe`

**Request format:**
```json
{
  "model": "GPT-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "English tutor system prompt..."
    },
    {
      "role": "user", 
      "content": "User message"
    }
  ],
  "temperature": 0.3,
  "max_tokens": 500,
  "stream": false
}
```

**Response format:**
```json
{
  "choices": [
    {
      "message": {
        "content": "AI response with corrections..."
      }
    }
  ]
}
```

### 6.2 Error handling
- **Network errors:** Retry logic với fallback message
- **API errors:** User-friendly error messages
- **Timeout:** 10 second timeout với loading indicator

---

## 7. CẤU HÌNH VÀ DEPLOYMENT

### 7.1 Environment Variables
```
REACT_APP_OPENAPI_ENDPOINT=https://your-api-endpoint.com
REACT_APP_OPENAPI_KEY=your-api-key
REACT_APP_OPENAPI_MODEL=gpt-4o-mini
```

### 7.2 Build Requirements
- **Node.js:** ≥ 14.0.0
- **npm:** ≥ 6.0.0
- **React:** 18.2.0
- **react-scripts:** 5.0.1

### 7.3 Browser Support
- **Chrome:** ≥ 88
- **Firefox:** ≥ 85
- **Safari:** ≥ 14
- **Edge:** ≥ 88

---

## 8. TESTING REQUIREMENTS

### 8.1 Unit Testing
- Component rendering tests
- Message formatting functions
- localStorage operations
- API call functions

### 8.2 Integration Testing
- End-to-end chat flow
- API integration
- Error scenarios
- Responsive design

### 8.3 User Acceptance Testing
- English learning effectiveness
- User experience flow
- Cross-device compatibility
- Performance benchmarks

---

## 9. BẢO TRÌ VÀ HỖ TRỢ

### 9.1 Monitoring
- API response times
- Error rates
- User engagement metrics
- Browser compatibility issues

### 9.2 Maintenance Tasks
- Regular dependency updates
- Security patches
- Performance optimization
- Feature enhancements

### 9.3 Support Documentation
- User guide cho học viên
- Technical documentation
- API integration guide
- Troubleshooting guide

---

## 10. RỦIRO VÀ GIẢM THIỂU

### 10.1 Technical Risks
- **API service downtime:** Implement fallback responses
- **Rate limiting:** Add request throttling
- **Browser compatibility:** Progressive enhancement
- **Data loss:** Robust localStorage error handling

### 10.2 User Experience Risks
- **Slow responses:** Loading indicators và timeout handling
- **Poor AI responses:** System prompt optimization
- **Confusing interface:** User testing và feedback loops
- **Mobile usability:** Responsive design testing

---

## 11. TIMELINE VÀ MILESTONES

### 11.1 Development Phases
1. **Phase 1:** Core chat functionality (Completed)
2. **Phase 2:** AI integration (Completed)
3. **Phase 3:** Rich formatting (Completed)
4. **Phase 4:** Enhancement và optimization (Future)

### 11.2 Future Enhancements
- User authentication
- Multiple conversation threads
- Voice input/output
- Progress tracking
- Lesson recommendations

---

**Tài liệu này được tạo ngày 26 tháng 7, 2025**  
**Version: 1.0**  
**Status: Final**
