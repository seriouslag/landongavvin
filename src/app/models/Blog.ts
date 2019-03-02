class Blog {
  content: string;
  footer: string;
  id: number;
  image: string;
  subtitle: string;
  title: string;
  hasVideo: boolean;
  videoType?: string;

  private videoList: string[] = [
    'ogv', 'ogm', 'ogg', 'mp4', 'webm', 'gifv'
  ];

  private imgList: string[] = [
    'png', 'bmp', 'jpeg', 'jpg', 'gif'
  ];

  constructor(content: string, footer: string, id: number, image: string, subtitle: string) {
    if (image.length === 0) { return; }

    const extension: string = image.substr(image.lastIndexOf('.') + 1).toLowerCase();

    if (this.videoList.some((type) => type === extension)) {
      this.hasVideo = true;
      if (extension === 'ogv' || extension === 'ogm') {
        this.videoType = 'ogg';
      } else {
        this.videoType = extension;
      }
      return;
    }

    if (this.imgList.some((type) => type === extension)) {
      return;
    }

    this.image = '';
  }
}

export { Blog };
