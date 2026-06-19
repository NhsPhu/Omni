import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Switch, Button, message, Select, Typography, Alert, Divider } from 'antd';
import { Bot, Sparkles, Save, Database } from 'lucide-react';
import api from '../../lib/axios';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function AiSettings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/shops/me/ai-settings');
      const settings = {
        enabled: data.aiChatbotEnabled ?? false,
        provider: data.aiProvider || 'gemini',
        personality: data.aiTone || 'professional',
        customInstructions: data.aiCustomInstructions || '',
      };
      form.setFieldsValue(settings);
      setIsEnabled(settings.enabled);
    } catch (error) {
      console.error('Error fetching AI settings:', error);
      message.error('Không thể tải cấu hình AI.');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await api.put('/shops/me/ai-settings', {
        aiChatbotEnabled: values.enabled,
        aiProvider: values.provider,
        aiTone: values.personality,
        aiCustomInstructions: values.customInstructions
      });
      message.success('Đã lưu cấu hình AI thành công!');
    } catch (error) {
      console.error('Error saving AI settings:', error);
      message.error('Có lỗi xảy ra khi lưu cấu hình.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
             style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
          <Sparkles size={20} />
        </div>
        <div>
          <Title level={4} style={{ margin: 0 }}>Cấu Hình Trợ Lý AI</Title>
          <Text type="secondary">Tùy chỉnh AI tư vấn bán hàng riêng cho cửa hàng của bạn</Text>
        </div>
      </div>

      <Alert
        message="Giới thiệu về OMNI AI"
        description="Trợ lý AI sẽ tự động học hỏi từ sản phẩm, bài đăng và mô tả của cửa hàng để tư vấn khách hàng 24/7. Bạn có thể tùy chỉnh tính cách và chỉ dẫn riêng cho AI."
        type="info"
        showIcon
        icon={<Bot />}
        className="bg-indigo-50 border-indigo-100"
      />

      <Card className="shadow-sm border-gray-100" loading={initialLoading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={(changedValues) => {
            if (changedValues.enabled !== undefined) {
              setIsEnabled(changedValues.enabled);
            }
          }}
        >
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-6">
            <div className="flex items-center gap-3">
              <Bot className="text-indigo-500" size={24} />
              <div>
                <h4 className="font-semibold text-gray-800 m-0">Kích hoạt AI Chatbot</h4>
                <Text type="secondary" className="text-sm">Bật/tắt trợ lý AI cho khách hàng của bạn</Text>
              </div>
            </div>
            <Form.Item name="enabled" valuePropName="checked" noStyle>
              <Switch />
            </Form.Item>
          </div>

          {isEnabled && (
            <div className="animate-fade-in space-y-6 mt-4">
              <Divider orientation="left" className="text-gray-400 font-normal m-0 text-sm">Cài đặt mô hình AI</Divider>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item 
                  name="provider" 
                  label="Mô hình ngôn ngữ"
                  tooltip="Gemini được cung cấp mặc định bởi hệ thống."
                >
                  <Select>
                    <Select.Option value="gemini">Google Gemini Pro (Khuyên dùng)</Select.Option>
                    <Select.Option value="openai" disabled>OpenAI GPT-4 (Sắp ra mắt)</Select.Option>
                  </Select>
                </Form.Item>
                
                <Form.Item 
                  name="personality" 
                  label="Phong cách giao tiếp"
                >
                  <Select>
                    <Select.Option value="professional">Chuyên nghiệp, Lịch sự</Select.Option>
                    <Select.Option value="friendly">Vui vẻ, Thân thiện</Select.Option>
                    <Select.Option value="concise">Ngắn gọn, Súc tích</Select.Option>
                  </Select>
                </Form.Item>
              </div>

              <Divider orientation="left" className="text-gray-400 font-normal m-0 text-sm">Hướng dẫn & Context</Divider>

              <Form.Item 
                name="customInstructions" 
                label="Chỉ dẫn tùy chỉnh (Prompt)"
                tooltip="Những điều AI cần lưu ý khi chat với khách hàng của shop bạn."
              >
                <TextArea 
                  rows={4} 
                  placeholder="Ví dụ: Shop chuyên bán đồ thể thao, hãy xưng hô là 'Shop' và 'Bạn'..."
                />
              </Form.Item>
              
              <div className="bg-blue-50 p-4 rounded-xl flex gap-3 border border-blue-100">
                <Database className="text-blue-500 shrink-0 mt-0.5" size={18} />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Dữ liệu nguồn (Knowledge Base)</p>
                  <p>AI sẽ tự động đọc các dữ liệu sau từ Shop của bạn để trả lời:</p>
                  <ul className="list-disc ml-4 mt-2 space-y-1 text-blue-700/80">
                    <li>Tên sản phẩm, mô tả, giá và tồn kho</li>
                    <li>Chính sách đổi trả, bảo hành đã thiết lập</li>
                    <li>Các chương trình Flash Sale và Voucher đang diễn ra</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end mt-8 pt-4 border-t border-gray-100">
            <Button 
              type="primary" 
              htmlType="submit" 
              icon={<Save size={16} />}
              loading={loading}
              className="bg-indigo-600 hover:bg-indigo-700 h-10 px-6"
            >
              Lưu cấu hình
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
