class Blog {

  private videoList: string[] = [
    'ogv', 'ogm', 'ogg', 'mp4', 'webm', 'gifv'
  ];

  private imgList: string[] = [
    'png', 'bmp', 'jpeg', 'jpg', 'gif'
  ];

  constructor(
    public  content: string,
    public  footer: string,
    public  id: number,
    public  image: string,
    public  subtitle: string,
    public  title: string,
    public  hasVideo: boolean,
    public  videoType?: string,
  ) {
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
