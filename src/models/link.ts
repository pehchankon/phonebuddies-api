interface Link {
  link_id: number;
  user_id: string;
  link_url: string;
  title: string;
  description: string | null;
  created_at: string;
}

export default Link;
