import { Button, Card, Col, Empty, Form, Input, Row, Select, Space, Table, Tag, Typography, message } from 'antd'
import { formatStatus } from '@/shared/lib/format'
import { useEffect, useState } from 'react'
import { createNews, fetchPortalNews, updateNewsStatus } from '@/shared/api/news'
import type { NewsPost, NewsStatus } from '@/shared/api/types'
import { PortalPageHeader } from '@/shared/components/portal/PortalPageHeader'
import { RichTextEditor } from '@/shared/components/editor/RichTextEditor'

export function NewsManagementPage() {
  const [form] = Form.useForm()
  const [items, setItems] = useState<NewsPost[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const watchedTitle = Form.useWatch('title', form) ?? ''
  const watchedSummary = Form.useWatch('summary', form) ?? ''
  const watchedCover = Form.useWatch('coverImageUrl', form) ?? ''
  const watchedContent = Form.useWatch('content', form) as Record<string, unknown> | undefined

  const loadNews = async () => {
    setLoading(true)
    try {
      const data = await fetchPortalNews()
      setItems(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadNews()
  }, [])

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <PortalPageHeader
        eyebrow="CMS"
        title="Gestión de noticias"
        description="Redacta publicaciones institucionales, verifica su presentación y controla el estado editorial desde un solo lugar."
        meta={['Editor institucional', 'Vista previa inmediata', 'Control editorial']}
      />
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <Card className="portal-panel" bordered={false} title="Editor de contenido">
            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              onFinish={async (values: {
                title: string
                slug: string
                coverImageUrl: string
                summary: string
                content: Record<string, unknown>
              }) => {
                setSubmitting(true)
                try {
                  await createNews({
                    slug: values.slug,
                    title: values.title,
                    summary: values.summary,
                    coverImageUrl: values.coverImageUrl,
                    content: values.content,
                  })
                  form.resetFields()
                  await loadNews()
                  void message.success('Noticia creada.')
                } finally {
                  setSubmitting(false)
                }
              }}
            >
              <Row gutter={16}>
                <Col xs={24} md={16}>
                  <Form.Item label="Título" name="title" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item label="Slug" name="slug" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item label="Imagen de portada" name="coverImageUrl" rules={[{ required: true }]}>
                <Input placeholder="https://..." />
              </Form.Item>
              <Form.Item label="Resumen" name="summary" rules={[{ required: true }]}>
                <Input.TextArea rows={3} />
              </Form.Item>
              <Form.Item label="Contenido" name="content" rules={[{ required: true, message: 'El contenido es obligatorio' }]}>
                <RichTextEditor placeholder="Escribe el contenido del artículo aquí..." />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Guardar noticia
              </Button>
            </Form>
          </Card>
        </Col>
        <Col xs={24} xl={10}>
          <Card className="portal-panel" bordered={false} title="Vista previa">
            {watchedTitle || watchedSummary || watchedCover || watchedContent ? (
              <div className="portal-news-preview">
                {watchedCover ? (
                  <div className="portal-news-preview__cover">
                    <img src={watchedCover} alt={watchedTitle || 'Vista previa de portada'} />
                  </div>
                ) : null}
                <Tag color="blue">Borrador</Tag>
                <Typography.Title level={3}>
                  {watchedTitle || 'El título aparecerá aquí'}
                </Typography.Title>
                <Typography.Paragraph>
                  {watchedSummary || 'El resumen institucional aparecerá en esta tarjeta de vista previa.'}
                </Typography.Paragraph>
                {watchedContent ? (
                  <RichTextEditor value={watchedContent} readOnly />
                ) : (
                  <Typography.Paragraph style={{ opacity: 0.5 }}>
                    El contenido principal se reflejará aquí para validar jerarquía y legibilidad.
                  </Typography.Paragraph>
                )}
              </div>
            ) : (
              <Empty description="Completa el formulario para ver la vista previa." />
            )}
          </Card>
        </Col>
      </Row>
      <Card className="portal-panel" bordered={false} title="Listado de publicaciones">
        <Table
          rowKey="id"
          loading={loading}
          pagination={false}
          columns={[
            { title: 'Título', dataIndex: 'title' },
            {
              title: 'Estado',
              render: (_, record: NewsPost) => (
                <Tag color={record.status === 'PUBLISHED' ? 'green' : record.status === 'ARCHIVED' ? 'default' : record.status === 'REVIEW' ? 'blue' : 'orange'}>
                  {formatStatus(record.status)}
                </Tag>
              ),
            },
            {
              title: 'Acción',
              render: (_, record: NewsPost) => (
                <Select
                  value={record.status}
                  style={{ width: 160 }}
                  onChange={async (status: NewsStatus) => {
                    await updateNewsStatus(record.id, status)
                    await loadNews()
                    void message.success('Estado actualizado.')
                  }}
                  options={[
                    { value: 'DRAFT', label: 'Borrador' },
                    { value: 'REVIEW', label: 'En revisión' },
                    { value: 'PUBLISHED', label: 'Publicado' },
                    { value: 'ARCHIVED', label: 'Archivado' },
                  ]}
                />
              ),
            },
          ]}
          dataSource={items}
        />
      </Card>
    </Space>
  )
}
